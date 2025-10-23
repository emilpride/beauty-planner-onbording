import 'dart:async';
import 'dart:developer';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;

class NetworkManager extends GetxController {
  static NetworkManager get instance => Get.find();

  final Connectivity _connectivity = Connectivity();
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;
  final Rx<ConnectivityResult> _connectivityStatus =
      ConnectivityResult.none.obs;

  // Cache the last check result to avoid excessive requests
  DateTime? _lastCheckTime;
  bool? _lastCheckResult;
  static const Duration _checkCacheDuration = Duration(seconds: 5);

  @override
  void onInit() {
    super.onInit();
    _initializeConnectivity();
  }

  Future<void> _initializeConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      await _updateConnectionStatus(result);
    } on PlatformException catch (e) {
      log('Connectivity initialization error: $e');
    }

    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      _updateConnectionStatus,
    );
  }

  Future<void> _updateConnectionStatus(List<ConnectivityResult> results) async {
    // Get the first non-none result, or none if all are none
    final result = results.firstWhere(
      (r) => r != ConnectivityResult.none,
      orElse: () => ConnectivityResult.none,
    );

    _connectivityStatus.value = result;

    if (result == ConnectivityResult.none) {
      _lastCheckResult = false;
    } else {
      // Clear cache when connection type changes
      _lastCheckResult = null;
    }
  }

  Future<bool> isConnected() async {
    try {
      // Return cached result if available and recent
      if (_lastCheckResult != null &&
          _lastCheckTime != null &&
          DateTime.now().difference(_lastCheckTime!) < _checkCacheDuration) {
        return _lastCheckResult!;
      }

      final List<ConnectivityResult> result =
          await _connectivity.checkConnectivity();

      if (result.contains(ConnectivityResult.none)) {
        _cacheResult(false);
        return false;
      }

      // Verify actual internet access with multiple fallback URLs
      final isOnline = await _checkInternetAccess();
      _cacheResult(isOnline);
      return isOnline;
    } on PlatformException catch (e) {
      log('Connectivity error: $e');
      return false;
    }
  }

  Future<bool> _checkInternetAccess() async {
    // On web, avoid cross-origin HEAD/GET checks which are blocked by CORS.
    // Rely on ConnectivityResult (navigator.onLine) instead.
    if (kIsWeb) {
      return _connectivityStatus.value != ConnectivityResult.none;
    }
    // List of reliable endpoints to check (fallback mechanism)
    final endpoints = [
      'https://clients3.google.com/generate_204', // Google's connectivity check endpoint
      'https://www.cloudflare.com/cdn-cgi/trace',
      'https://www.gstatic.com/generate_204',
    ];

    for (final endpoint in endpoints) {
      try {
        final response = await http
            .head(
              Uri.parse(endpoint),
            ) // Use HEAD instead of GET for lighter requests
            .timeout(const Duration(seconds: 5));

        log('Network status from $endpoint: ${response.statusCode}');

        // Accept any successful response code (200-299)
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return true;
        }

        // For 204 (No Content) which is expected from some endpoints
        if (response.statusCode == 204) {
          return true;
        }
      } on TimeoutException {
        log('Connection timed out for $endpoint');
        continue; // Try next endpoint
      } on Exception catch (e) {
        log('Unexpected error from $endpoint: $e');
        continue; // Try next endpoint
      }
    }

    // All endpoints failed
    return false;
  }

  void _cacheResult(bool result) {
    _lastCheckResult = result;
    _lastCheckTime = DateTime.now();
  }

  // Optional: Force refresh the cache
  Future<bool> checkConnectionForced() async {
    _lastCheckResult = null;
    _lastCheckTime = null;
    return await isConnected();
  }

  // Getter for connection status
  bool get isConnectionActive =>
      _connectivityStatus.value != ConnectivityResult.none;

  @override
  void onClose() {
    super.onClose();
    _connectivitySubscription.cancel();
  }
}
