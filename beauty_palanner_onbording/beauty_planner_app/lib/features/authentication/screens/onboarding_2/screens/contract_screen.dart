import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:signature/signature.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../../subscriptions/screens/results/result_screen.dart';

class ContractScreen extends StatefulWidget {
  const ContractScreen({super.key});

  @override
  State<ContractScreen> createState() => _ContractScreenState();
}

class _ContractScreenState extends State<ContractScreen> {
  final SignatureController _controller = SignatureController(
    penStrokeWidth: 2,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Let's Make A Contract",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "Review & sign your personalized commitment to achieving your goals with Beauty Mirror.",
                style: TextStyle(fontSize: 16, color: Colors.grey[600]!),
              ),
              const SizedBox(height: 30),
              // Commitment list
              _buildCommitmentItem("I commit to tracking my Activities daily"),
              Divider(color: Colors.grey.shade300, thickness: 1),
              _buildCommitmentItem("I promise to prioritize my well-being"),
              Divider(color: Colors.grey.shade300, thickness: 1),
              _buildCommitmentItem(
                "I will strive for consistency and progress",
              ),
              Divider(color: Colors.grey.shade300, thickness: 1),
              _buildCommitmentItem(
                "I understand that change takes time and effort",
              ),
              const SizedBox(height: 24),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Sign using your finger:",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.darkGrey,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Signature Pad
              Container(
                height: 220,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300, width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Signature(
                    controller: _controller,
                    height: 220,
                    backgroundColor: Colors.grey[50]!,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Clear button
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => _controller.clear(),
                  child: const Text(
                    "Clear Signature",
                    style: TextStyle(color: AppColors.darkGrey),
                  ),
                ),
              ),
              const SizedBox(height: 30),
              SizedBox(
                height: 50,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (_controller.isNotEmpty) {
                      UserController.instance.updateOnboardingCompletion();
                      Get.to(() => const ResultScreen());
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Please provide your signature."),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Finish",
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCommitmentItem(String text) {
    return Row(
      children: [
        SvgPicture.asset(AppImages.contractStar, height: 24, width: 24),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
