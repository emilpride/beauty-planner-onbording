import 'package:flutter/material.dart';

import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';

class NoInternetScreen extends StatefulWidget {
  const NoInternetScreen({super.key});

  @override
  State<NoInternetScreen> createState() => _NoInternetScreenState();
}

class _NoInternetScreenState extends State<NoInternetScreen> {
  bool _showContent = false;
  bool _isRetrying = false;
  int _cooldownSeconds = 0;

  @override
  void initState() {
    super.initState();
    // Trigger animation after build completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() => _showContent = true);
    });
  }

  void _startCooldown() {
    setState(() {
      _isRetrying = true;
      _cooldownSeconds = 5;
    });

    // Start cooldown timer
    for (int i = 5; i > 0; i--) {
      Future.delayed(Duration(seconds: 5 - i), () {
        if (mounted) {
          setState(() {
            _cooldownSeconds = i - 1;
            if (_cooldownSeconds == 0) {
              _isRetrying = false;
            }
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: AppSizes.xl * 2),
            AnimatedOpacity(
              opacity: _showContent ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 500),
              child: AnimatedSlide(
                offset: _showContent ? Offset.zero : const Offset(0, 0.2),
                duration: const Duration(milliseconds: 500),
                child: const Icon(
                  Icons.wifi_off_rounded,
                  size: 96,
                  color:
                      Colors
                          .black, //Theme.themeData.iconTheme.color?.withOpacity(0.8),
                ),
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Connection Lost',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            const Text(
              'Please check your network and try again',
              style: TextStyle(color: AppColors.darkGrey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  backgroundColor:
                      _isRetrying ? AppColors.darkGrey : AppColors.primary,
                  elevation: 0,
                ),
                onPressed:
                    _isRetrying
                        ? null
                        : () {
                          _startCooldown();
                          AuthenticationRepository.instance.screenRedirect();
                        },
                child:
                    _isRetrying
                        ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                  AppColors.white,
                                ),
                                value:
                                    _cooldownSeconds > 0
                                        ? (_cooldownSeconds / 5.0)
                                        : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Retry in ${_cooldownSeconds}s',
                              style: const TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        )
                        : const Text(
                          'Retry',
                          style: TextStyle(
                            color: AppColors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
