import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/utils/constants/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../utils/constants/image_strings.dart';

// --- DATA MODEL ---
/// Represents a single FAQ item.
class FaqItem {
  final String category;
  final String question;
  final String answer;

  FaqItem({
    required this.category,
    required this.question,
    required this.answer,
  });
}

class FaqController extends GetxController {
  // --- STATE VARIABLES ---

  /// Controls the text input for the search field.
  final TextEditingController searchController = TextEditingController();

  /// A reactive list holding all the original FAQ items.
  final RxList<FaqItem> _allFaqs = <FaqItem>[].obs;

  /// A reactive list of FAQs filtered by category and search query, this is what the UI shows.
  final RxList<FaqItem> filteredFaqs = <FaqItem>[].obs;

  /// The list of available categories for filtering.
  final List<String> categories = [
    'General',
    'Account',
    'Service',
    'Activities',
  ];

  /// The currently selected filter category. Defaults to 'General'.
  final RxString selectedCategory = 'General'.obs;

  /// The index of the currently expanded FAQ item. -1 means all are collapsed.
  final RxInt expandedIndex =
      0.obs; // First item is expanded by default as in the UI.

  // --- INITIALIZATION ---

  @override
  void onInit() {
    super.onInit();
    // Load the initial FAQ data.
    _loadFaqData();
    // Add a listener to the search controller to filter as the user types.
    searchController.addListener(_filterFaqs);
    // Perform initial filtering when the controller is ready.
    _filterFaqs();
  }

  // --- CORE LOGIC ---

  /// Populates the list with sample FAQ data.
  void _loadFaqData() {
    _allFaqs.assignAll([
      FaqItem(
        category: 'General',
        question: 'What is Beauty Mirror?',
        answer:
            'Beauty Mirror is an Activity tracking app designed to help you build and maintain positive Activities for a healthier and more productive life.',
      ),
      FaqItem(
        category: 'General',
        question: 'How does Beauty Mirror work?',
        answer:
            'You can select from a list of predefined activities or create your own custom ones. The app will then help you track your progress and build consistent habits.',
      ),
      FaqItem(
        category: 'Activities',
        question: 'Can I track multiple Activities?',
        answer:
            'Yes, you can add and track as many activities as you like simultaneously.',
      ),
      FaqItem(
        category: 'Account',
        question: 'Is Beauty Mirror free to use?',
        answer:
            'Yes, the core features of Beauty Mirror are completely free to use. There may be optional premium features in the future.',
      ),
      FaqItem(
        category: 'Account',
        question: 'Is my data secure with Beauty Mirror?',
        answer:
            'We take data security very seriously. All your data is stored securely and is never shared with third parties without your consent.',
      ),
      FaqItem(
        category: 'Service',
        question: 'Can I export my Beauty Mirror data?',
        answer:
            'Absolutely. You can export your activity data at any time from the account settings page.',
      ),
    ]);
  }

  /// Filters the FAQ list based on the selected category and search query.
  void _filterFaqs() {
    final searchQuery = searchController.text.toLowerCase();
    final category = selectedCategory.value;

    // Filter the list
    final filtered =
        _allFaqs.where((faq) {
          final matchesCategory = faq.category == category;
          final matchesSearch =
              faq.question.toLowerCase().contains(searchQuery) ||
              faq.answer.toLowerCase().contains(searchQuery);
          return matchesCategory && matchesSearch;
        }).toList();

    filteredFaqs.assignAll(filtered);
    // Collapse any expanded item when the list changes
    expandedIndex.value = -1;
  }

  /// Sets the filter category and triggers a re-filter.
  void setCategory(String category) {
    selectedCategory.value = category;
    _filterFaqs();
  }

  /// Toggles the expansion state of an FAQ item at a given index.
  void toggleExpansion(int index) {
    // If the tapped item is already expanded, collapse it. Otherwise, expand it.
    expandedIndex.value = expandedIndex.value == index ? -1 : index;
  }

  // --- CLEANUP ---

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}

class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize the controller
    final FaqController controller = Get.put(FaqController());

    return Scaffold(
      backgroundColor: AppColors.light,
      appBar: const BMAppbar(title: 'FAQ'),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          children: [
            const SizedBox(height: 16),
            _buildSearchField(controller, context),
            const SizedBox(height: 24),
            _buildFilterChips(controller),
            const SizedBox(height: 24),
            _buildFaqList(controller),
          ],
        ),
      ),
    );
  }

  /// Builds the search text field.
  Widget _buildSearchField(FaqController controller, BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
      width: MediaQuery.of(context).size.width * 0.9,
      height: 68.0,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[300]!, width: 1.0),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                AppImages.searchSvg,
                width: 24,
                height: 24,
                color: Colors.grey[500],
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: TextFormField(
                  controller: controller.searchController,
                  decoration: InputDecoration(
                    hintText: 'Search',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                    hintStyle: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey[500],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds the horizontal list of filter chips.
  Widget _buildFilterChips(FaqController controller) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: controller.categories.length,
        itemBuilder: (context, index) {
          final category = controller.categories[index];
          return Obx(() {
            final isSelected = controller.selectedCategory.value == category;
            return GestureDetector(
              onTap: () => controller.setCategory(category),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF8A74E4) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    category,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            );
          });
        },
        separatorBuilder: (context, index) => const SizedBox(width: 10),
      ),
    );
  }

  /// Builds the scrollable list of expandable FAQ items.
  Widget _buildFaqList(FaqController controller) {
    return Expanded(
      child: Obx(
        () => ListView.separated(
          itemCount: controller.filteredFaqs.length,
          itemBuilder: (context, index) {
            final faq = controller.filteredFaqs[index];
            return Obx(() {
              final isExpanded = controller.expandedIndex.value == index;
              return GestureDetector(
                onTap: () => controller.toggleExpansion(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              faq.question,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          Icon(
                            size: 24,
                            isExpanded
                                ? Icons.keyboard_arrow_up
                                : Icons.keyboard_arrow_down,
                            color: AppColors.textPrimary,
                          ),
                        ],
                      ),
                      // Animated visibility for the answer
                      AnimatedCrossFade(
                        firstChild:
                            Container(), // Empty container when collapsed
                        secondChild: Padding(
                          padding: const EdgeInsets.only(top: 12.0),
                          child: Column(
                            children: [
                              Divider(color: Colors.grey[300], thickness: 0.5),
                              const SizedBox(height: 8),
                              Text(
                                faq.answer,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.black,
                                ),
                              ),
                            ],
                          ),
                        ),
                        crossFadeState:
                            isExpanded
                                ? CrossFadeState.showSecond
                                : CrossFadeState.showFirst,
                        duration: const Duration(milliseconds: 300),
                      ),
                    ],
                  ),
                ),
              );
            });
          },
          separatorBuilder: (context, index) => const SizedBox(height: 12),
        ),
      ),
    );
  }
}
