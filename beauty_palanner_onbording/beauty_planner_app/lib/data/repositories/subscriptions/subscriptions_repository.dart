import 'dart:developer';
import 'dart:io';
import 'package:currency_code_to_currency_symbol/currency_code_to_currency_symbol.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import '../../../common/widgets/loaders/progress_dialog.dart';
import '../../../utils/local_storage/storage_utility.dart';
import '../../models/user_model.dart';
// import '../../services/remote_config/remote_config_service.dart';

class SubscriptionsRepository extends GetxController {
  var customerInfo = Rxn<CustomerInfo>();

  /// The entitlement ID you set up in RevenueCat dashboard.
  final String entitlementId = "Premium";

  /// Observable variables to hold customer info and subscription status.
  var isSubscribed = false.obs;

  var offerings = Rxn<Offerings>();

  /// Observable list of packages fetched from RevenueCat offerings.
  var packages = <Package>[].obs;

  // final remoteConfig = Get.put(RemoteConfigService());

  /// Observable for the selected plan index.
  var selectedIndex = 0.obs;

  UserModel userModel = UserModel.empty();

  //promocode textcontroller
  final promoCodeController = TextEditingController();
  //form key for promo code
  final promoCodeFormKey = GlobalKey<FormState>();

  static SubscriptionsRepository get instance => Get.find();

  void changeIndex(int index) {
    selectedIndex.value = index;
  }

  Future<void> initialize() async {
    try {
      await Purchases.setDebugLogsEnabled(true);

      LocalStorage storage = LocalStorage.instance();
      userModel = UserModel.fromJson(storage.readData('User'));

      // await remoteConfig.initialize();

      // Choose the correct API key based on the platform
      final apiKey =
          Platform.isAndroid
              ? 'goog_eslldNAAJaQuuTHJAYrjmIYXwis'
              : 'appl_fSyBDUXrmTlHTqhHnGOHOvzAKcp'; //remoteConfig.revenuecatApiKey();

      // Configure the Purchases SDK
      final configuration = PurchasesConfiguration(apiKey);

      //set an appUserID if you use your own user identifiers
      configuration.appUserID = userModel.id;

      // Purchases.logIn(userModel.id);

      await Purchases.configure(configuration);

      // Fetch initial data.
      await fetchCustomerInfo();
      await fetchOfferings();

      // Listen for customer info updates.
      Purchases.addCustomerInfoUpdateListener((info) {
        customerInfo.value = info;
        isSubscribed.value =
            info.entitlements.all[entitlementId]?.isActive ?? false;
      });
    } catch (e) {
      log('Error initializing subscriptions: $e');
    }
  }

  /// Fetch the latest customer info from RevenueCat.
  Future<void> fetchCustomerInfo() async {
    try {
      CustomerInfo info = await Purchases.getCustomerInfo();
      customerInfo.value = info;
      isSubscribed.value =
          info.entitlements.all[entitlementId]?.isActive ?? false;
    } catch (e) {
      log("Error fetching customer info: $e");
    }
  }

  /// Fetch offerings from RevenueCat and store available packages.
  Future<void> fetchOfferings() async {
    try {
      final offeringsData = await Purchases.getOfferings();
      if (offeringsData.current != null &&
          offeringsData.current!.availablePackages.isNotEmpty) {
        packages.assignAll(offeringsData.current!.availablePackages);
      }
    } catch (e) {
      log("Error fetching offerins: $e");
    }
  }

  /// Purchase the subscription associated with the selected plan.
  /// Here, we assume that the order of PricePlansCard widgets matches the order of packages.

  Future<bool> purchaseSelectedPlan() async {
    Get.dialog(
      const ProgressDialog(title: 'Processing Payment...'),
      barrierDismissible: false,
    );
    if (packages.isEmpty) {
      Get.back();
      return false;
    }
    try {
      final package = packages[selectedIndex.value];
      final customerInfo = await Purchases.purchasePackage(package);
      bool active =
          customerInfo.customerInfo.entitlements.all[entitlementId]?.isActive ??
          false;
      isSubscribed.value = active;
      Get.back();
      return active;
    } on PlatformException catch (e) {
      log("Purchase error: $e");
      Get.back();
      return false;
    } catch (e) {
      log("Unknown purchase error: $e");
      Get.back();
      return false;
    }
  }

  /// Restores previous purchases for the current user.
  Future<void> restorePurchases() async {
    Get.dialog(
      const ProgressDialog(title: 'Restoring Purchases...'),
      barrierDismissible: false,
    );
    try {
      CustomerInfo info = await Purchases.restorePurchases();
      customerInfo.value = info;
      isSubscribed.value =
          info.entitlements.all[entitlementId]?.isActive ?? false;

      Get.back();
    } catch (e) {
      log("Error restoring purchases: $e");
      Get.back();
    }
  }

  /// Parse an ISO-8601 period string (e.g. "P1W", "P3M", "P1Y") into days.
  double daysInIsoPeriod(String iso) {
    final match = RegExp(r'P(\d+)([DWMY])').firstMatch(iso);
    if (match != null) {
      final value = int.parse(match.group(1)!);
      switch (match.group(2)) {
        case 'D':
          return value.toDouble();
        case 'W':
          return value * 7;
        case 'M':
          return value * 30.4;
        case 'Y':
          return value * 365;
      }
    }
    return 0;
  }

  /// Turn an ISO-8601 period into a human-friendly label.
  String durationLabelFromIso(String iso) {
    final match = RegExp(r'P(\d+)([DWMY])').firstMatch(iso);
    if (match != null) {
      final value = int.parse(match.group(1)!);
      final unit = match.group(2);
      switch (unit) {
        case 'D':
          return '$value day${value > 1 ? 's' : ''}';
        case 'W':
          return '$value week${value > 1 ? 's' : ''}';
        case 'M':
          return value == 1 ? 'Monthly' : '$value months';
        case 'Y':
          return value == 1 ? 'Annual' : '$value years';
      }
    }
    return '';
  }

  String durationLabelFromIsoFormal(String iso) {
    final match = RegExp(r'P(\d+)([DWMY])').firstMatch(iso);
    if (match != null) {
      final value = int.parse(match.group(1)!);
      final unit = match.group(2);
      switch (unit) {
        case 'D':
          return '$value day${value > 1 ? 's' : ''}';
        case 'W':
          return '$value week${value > 1 ? 's' : ''}';
        case 'M':
          return value == 1 ? 'Month' : '$value months';
        case 'Y':
          return value == 1 ? 'Year' : '$value years';
      }
    }
    return '';
  }

  /// Format a price-per-day string in the user’s locale.
  String perDayString({
    required double totalPrice,
    required double days,
    required String currencyCode,
  }) {
    final symbol = getCurrencySymbol(currencyCode);
    final perDay = days > 0 ? totalPrice / days : totalPrice;
    return '$symbol${perDay.toStringAsFixed(2)}/day';
  }

  String pricePlan({required Package package}) {
    final symbol = getCurrencySymbol(package.storeProduct.currencyCode);
    final price = package.storeProduct.price.toStringAsFixed(1);
    return '$symbol$price';
  }

  int parseIsoPeriodToDays(String iso) {
    // Matches P[n]Y[n]M[n]W[n]D (ignores time component)
    final regex = RegExp(
      r'^P'
      r'(?:(\d+)Y)?' // years
      r'(?:(\d+)M)?' // months
      r'(?:(\d+)W)?' // weeks
      r'(?:(\d+)D)?' // days
      r'$',
    );
    final match = regex.firstMatch(iso);
    if (match == null) {
      throw FormatException('Invalid ISO 8601 period: $iso');
    }
    final years = int.parse(match.group(1) ?? '0');
    final months = int.parse(match.group(2) ?? '0');
    final weeks = int.parse(match.group(3) ?? '0');
    final days = int.parse(match.group(4) ?? '0');

    // Approximate: 1 year = 365 days, 1 month = 30 days
    return years * 365 + months * 30 + weeks * 7 + days;
  }

  //turn number of trial days into number of weeks
  String daysToWeeks(StoreProduct product) {
    int trialDays = 0;
    if (!Platform.isIOS) {
      final option = product.subscriptionOptions?.firstWhereOrNull(
        (o) => o.freePhase != null,
      );
      if (option != null) {
        trialDays = parseIsoPeriodToDays(
          option.freePhase!.billingPeriod!.iso8601,
        );
      }
    }
    // For iOS: use introductoryPrice
    else {
      final intro = product.introductoryPrice;
      if (intro != null) {
        trialDays = parseIsoPeriodToDays(intro.period);
      }
    }

    final weeks = (trialDays / 7).ceil();
    switch (weeks) {
      case 1:
        return 'one week';
      case 2:
        return 'two weeks';
      case 3:
        return 'three weeks';
      default:
        return '$weeks weeks';
    }
  }
}
