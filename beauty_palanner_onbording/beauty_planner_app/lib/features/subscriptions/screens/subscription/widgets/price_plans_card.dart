import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/repositories/subscriptions/subscriptions_repository.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';

class PricePlanCard extends StatelessWidget {
  const PricePlanCard({
    super.key,
    required this.package,
    required this.isSelected,
    required this.onTap,
    required this.idx,
  });

  final Package package; // from offerings.current.availablePackages
  final bool isSelected;
  final int idx;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final controller = SubscriptionsRepository.instance;
    final product = package.storeProduct; // SKU details
    final code = product.currencyCode; // ISO 4217 code

    // FULL price info
    final fullPrice = product.price; // e.g. 99.99

    // DURATION in days (ISO-8601) for cross-platform
    final isoPeriod = product.subscriptionPeriod ?? '';
    final days = controller.daysInIsoPeriod(isoPeriod);
    final perday = controller.perDayString(
      totalPrice: fullPrice,
      days: days,
      currencyCode: code,
    );

    final price = controller.pricePlan(package: package);

    int trialDays = 0;

    // final option = product.subscriptionOptions
    //     ?.firstWhereOrNull((o) => o.freePhase != null);

    // if (option != null) {
    //   final iso = option.freePhase!.billingPeriod; // e.g. "P7D"
    //   trialDays = controller.parseIsoPeriodToDays(iso!.iso8601);
    // }

    // For Android: use subscriptionOptions.freePhase
    if (!Platform.isIOS) {
      final option = product.subscriptionOptions?.firstWhereOrNull(
        (o) => o.freePhase != null,
      );
      if (option != null) {
        trialDays = controller.parseIsoPeriodToDays(
          option.freePhase!.billingPeriod!.iso8601,
        );
      }
    }
    // For iOS: use introductoryPrice
    else {
      final intro = product.introductoryPrice;
      if (intro != null) {
        trialDays = controller.parseIsoPeriodToDays(intro.period);
      }
    }

    // LABEL for header
    final headerLabel = controller.durationLabelFromIso(isoPeriod);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 120),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: AppColors.white,
          border: Border.all(
            color:
                isSelected
                    ? Colors.yellow
                    : headerLabel == '6 months'
                    ? Colors.yellow
                    : AppColors.primary,
            width: isSelected ? 3 : 1,
          ),
        ),
        child: Column(
          children: [
            // Top bar
            headerLabel == '6 months'
                ? Container(
                  height: 40,
                  decoration: const BoxDecoration(
                    color: Colors.yellow,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      topRight: Radius.circular(10),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      (headerLabel == '6 months')
                          ? 'Most Popular'
                          : headerLabel,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                  ),
                )
                : const SizedBox.shrink(),

            // Body: prices & trial
            Padding(
              padding: const EdgeInsets.all(AppSizes.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,

                    children: [
                      Text(
                        isoPeriod == 'P1M'
                            ? 'Monthly'
                            : isoPeriod == 'P3M'
                            ? '3 Months'
                            : isoPeriod == 'P6M'
                            ? '6 Months'
                            : isoPeriod == 'P1Y'
                            ? 'Annual'
                            : headerLabel,
                        style: const TextStyle(
                          fontSize: 26,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        price,
                        style: const TextStyle(
                          fontSize: 26,
                          color: AppColors.black,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      if (trialDays > 0) ...[
                        const SizedBox(width: AppSizes.spaceBtnSections),
                        Text(
                          '$trialDays days free trial',
                          overflow: TextOverflow.ellipsis,
                          maxLines: 2,
                          style: const TextStyle(
                            fontSize: 18,
                            color: Colors.red,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                      trialDays > 0
                          ? const SizedBox.shrink()
                          : const SizedBox(
                            width: AppSizes.spaceBtnSections * 2,
                          ),
                      Text(
                        perday,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
