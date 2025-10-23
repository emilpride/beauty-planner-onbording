import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/diagrams/animated_progress_bar.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/helpers/mood_helper.dart';
import '../../../controllers/mood_controller.dart';
import 'feeling_chip.dart';

class AddMoodBottomSheet extends StatefulWidget {
  const AddMoodBottomSheet({super.key});

  @override
  _AddMoodBottomSheetState createState() => _AddMoodBottomSheetState();
}

class _AddMoodBottomSheetState extends State<AddMoodBottomSheet> {
  final PageController _pageController = PageController();
  final MoodController _moodController = Get.find();

  int _currentPage = 0;
  int _selectedMoodIndex = -1; // 1 to 5
  String _selectedFeeling = '';

  final List<Map<String, dynamic>> _moods = [
    {'label': 'Great', 'emoji': AppImages.great, 'index': 1},
    {'label': 'Good', 'emoji': AppImages.good, 'index': 2},
    {'label': 'Okay', 'emoji': AppImages.okay, 'index': 3},
    {'label': 'Not Good', 'emoji': AppImages.notGood, 'index': 4},
    {'label': 'Bad', 'emoji': AppImages.bad, 'index': 5},
  ];

  @override
  void initState() {
    super.initState();
    _pageController.addListener(() {
      if (_pageController.page!.round() != _currentPage) {
        setState(() {
          _currentPage = _pageController.page!.round();
        });
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onOkPressed() {
    if (_currentPage == 0) {
      if (_selectedMoodIndex != -1) {
        _pageController.animateToPage(
          1,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      }
    } else {
      if (_selectedFeeling.isNotEmpty) {
        _moodController.addMoodEntry(_selectedMoodIndex, _selectedFeeling);
        Get.back(); // Close bottom sheet
      }
    }
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        alignment: WrapAlignment.center,
        children:
            _moods.map((mood) {
              final bool isSelected = _selectedMoodIndex == mood['index'];
              return GestureDetector(
                onTap: () => setState(() => _selectedMoodIndex = mood['index']),
                child: AnimatedContainer(
                  width: 100,
                  height: 130,
                  duration: const Duration(milliseconds: 200),
                  // padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color:
                          isSelected ? AppColors.primary : Colors.transparent,
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(mood['emoji'], width: 60, height: 60),
                      const SizedBox(height: 8),
                      Text(
                        mood['label'],
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight:
                              isSelected ? FontWeight.bold : FontWeight.normal,
                          color:
                              isSelected
                                  ? AppColors.textWhite
                                  : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
      ),
    );
  }

  Widget _buildStep2() {
    String moodLabel = MoodDataHelper.getLabel(_selectedMoodIndex);
    List<String> feelings = MoodDataHelper.getFeelings(moodLabel);

    return Column(
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          alignment: WrapAlignment.spaceAround,
          children:
              feelings.map((feeling) {
                return FeelingChip(
                  label: feeling,
                  isSelected: _selectedFeeling == feeling,
                  onTap: () => setState(() => _selectedFeeling = feeling),
                );
              }).toList(),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    bool isOkEnabled =
        (_currentPage == 0 && _selectedMoodIndex != -1) ||
        (_currentPage == 1 && _selectedFeeling.isNotEmpty);

    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.85,
      child: Container(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Choose mood",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              // Placeholder for the 3D character image
              RoundedContainer(
                backgroundColor: AppColors.primary.withOpacity(0.1),
                height: 320,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Image.asset(
                        AppImages.chooseMood,
                        height: 200,
                        errorBuilder:
                            (c, e, s) => Container(
                              height: 150,
                              color: AppColors.lightGrey,
                              child: const Center(
                                child: Text('Image Placeholder'),
                              ),
                            ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _selectedMoodIndex < 0 || _currentPage == 0
                            ? const Text(
                              "How is your mood today?",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                              ),
                            )
                            : SizedBox(
                              width: 260,
                              child: Text(
                                '${MoodDataHelper.getLabel(_selectedMoodIndex)}! How would you describe your feelings?',
                                maxLines: 2,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),

                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                            children: [
                              TextSpan(
                                text: '${_currentPage + 1}',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const TextSpan(text: '/2'),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: AnimatedProgressBar(
                            currentStep: _currentPage + 1,
                            totalSteps: 2,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              SizedBox(
                height: 250, // Fixed height for the PageView content
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [_buildStep1(), _buildStep2()],
                ),
              ),

              // const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "Cancel",
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      onPressed: () => Get.back(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: isOkEnabled ? _onOkPressed : null,
                      child: const Text(
                        "OK",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
