import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';

class GenderDropDown extends FormField<String> {
  final String label;
  final RxString selectedValueRx; // Use RxString for GetX state management
  final List<String> items;
  final ValueChanged<String?>
  onChangedExternal; // External onChanged for updates

  GenderDropDown({
    super.key,
    required this.label,
    required this.selectedValueRx,
    required this.items,
    required this.onChangedExternal,
    super.validator, // Add validator property
    AutovalidateMode super.autovalidateMode =
        AutovalidateMode.disabled, // Default to disabled
  }) : super(
         initialValue:
             selectedValueRx.value.isNotEmpty ? selectedValueRx.value : null,
         builder: (FormFieldState<String> state) {
           // Cast state to access our custom state properties
           final _CustomDropdownEthnicGroupFieldState fieldState =
               state as _CustomDropdownEthnicGroupFieldState;

           // Determine border color based on validation state
           Color borderColor = AppColors.primary;
           if (state.hasError) {
             borderColor = Colors.red;
           } else if (fieldState._isOptionsVisible) {
             borderColor = const Color(0xFF8A60FF); // Focused color
           } else if (state.isValid &&
               state.value != null &&
               state.value!.isNotEmpty &&
               autovalidateMode != AutovalidateMode.disabled) {
             // Optional: Green border if valid and value is selected
             // borderColor = Colors.green;
           }

           return Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               label.isEmpty
                   ? const SizedBox.shrink()
                   : Text(
                     label,
                     style: const TextStyle(
                       fontSize: 14,
                       fontWeight: FontWeight.w700,
                       color: AppColors.textPrimary,
                     ),
                   ),
               label.isEmpty
                   ? const SizedBox.shrink()
                   : const SizedBox(height: 8),
               CompositedTransformTarget(
                 link: fieldState._layerLink,
                 child: GestureDetector(
                   onTap: fieldState._toggleOptionsVisibility,
                   child: Container(
                     padding: const EdgeInsets.symmetric(
                       horizontal: 16,
                       vertical: 14,
                     ),
                     decoration: BoxDecoration(
                       color: Colors.white,
                       borderRadius: BorderRadius.circular(12),
                       border: Border.all(color: borderColor),
                     ),
                     child: Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                         Flexible(
                           child: Obx(() {
                             // Use Obx to react to changes in selectedValueRx
                             final displayValue =
                                 selectedValueRx.value.isNotEmpty
                                     ? selectedValueRx.value
                                     : 'Choose the ${label.toLowerCase()}';
                             return Text(
                               displayValue,
                               style: TextStyle(color: Colors.grey[600]),
                             );
                           }),
                         ),
                         const Icon(
                           Icons.unfold_more_rounded,
                           color: Colors.grey,
                         ),
                       ],
                     ),
                   ),
                 ),
               ),
               // Custom options container displayed conditionally
               if (fieldState._isOptionsVisible)
                 CompositedTransformFollower(
                   link: fieldState._layerLink,
                   showWhenUnlinked: false,
                   offset: const Offset(
                     0,
                     60,
                   ), // Adjust this offset to position correctly
                   child: Material(
                     elevation: 0,
                     borderRadius: BorderRadius.circular(12),
                     child: Container(
                       decoration: BoxDecoration(
                         color: Colors.white,
                         borderRadius: BorderRadius.circular(12),
                         border: Border.all(color: borderColor),
                         boxShadow: [
                           BoxShadow(
                             color: Colors.black.withOpacity(0.1),
                             blurRadius: 8,
                             offset: const Offset(0, 2),
                           ),
                         ],
                       ),
                       child: Column(
                         mainAxisSize: MainAxisSize.min,
                         children:
                             items.map((item) {
                               return GestureDetector(
                                 onTap: () {
                                   // 1. Update FormField's internal value. This triggers validation.
                                   state.didChange(item);
                                   // 2. Update GetX RxString
                                   selectedValueRx.value = item;
                                   // 3. Call external onChanged callback
                                   onChangedExternal(item);
                                   // 4. Hide the options
                                   fieldState._toggleOptionsVisibility();
                                 },
                                 child: Container(
                                   width: double.infinity,
                                   padding:
                                       item == 'Create New Category'
                                           ? null
                                           : const EdgeInsets.symmetric(
                                             vertical: 12,
                                             horizontal: 16,
                                           ),
                                   decoration: BoxDecoration(
                                     color:
                                         selectedValueRx.value == item
                                             ? AppColors.softGrey
                                             : Colors.transparent,
                                     borderRadius:
                                         item == items.first
                                             ? const BorderRadius.vertical(
                                               top: Radius.circular(12),
                                             )
                                             : item == items.last
                                             ? const BorderRadius.vertical(
                                               bottom: Radius.circular(12),
                                             )
                                             : null,
                                   ),
                                   child:
                                       item == 'Create New Category'
                                           ? Container(
                                             padding:
                                                 const EdgeInsets.symmetric(
                                                   vertical: 12.0,
                                                   horizontal: 16.0,
                                                 ),
                                             decoration: const BoxDecoration(
                                               color: AppColors.primary,
                                               borderRadius: BorderRadius.only(
                                                 topLeft: Radius.circular(10.0),
                                                 topRight: Radius.circular(
                                                   10.0,
                                                 ),
                                               ),
                                             ),
                                             child: const Row(
                                               mainAxisAlignment:
                                                   MainAxisAlignment.center,
                                               children: [
                                                 Icon(
                                                   Icons.add,
                                                   size: 20,
                                                   color: Colors.white,
                                                 ),
                                                 SizedBox(width: 8.0),
                                                 Text(
                                                   'Create New Category',
                                                   style: TextStyle(
                                                     fontSize: 14.0,
                                                     fontWeight:
                                                         FontWeight.w500,
                                                     color: Colors.white,
                                                   ),
                                                 ),
                                               ],
                                             ),
                                           )
                                           : Row(
                                             mainAxisAlignment:
                                                 MainAxisAlignment.spaceBetween,
                                             children: [
                                               Text(
                                                 item,
                                                 style: TextStyle(
                                                   color: Colors.black,
                                                   fontWeight:
                                                       selectedValueRx.value ==
                                                               item
                                                           ? FontWeight.w700
                                                           : FontWeight.w500,
                                                 ),
                                               ),
                                               if (selectedValueRx.value ==
                                                   item)
                                                 const Icon(
                                                   Icons.check,
                                                   color: AppColors.textPrimary,
                                                 ),
                                             ],
                                           ),
                                 ),
                               );
                             }).toList(),
                       ),
                     ),
                   ),
                 ),
               // Display error text if validation fails
               if (state.hasError)
                 Padding(
                   padding: const EdgeInsets.only(top: 8.0, left: 12.0),
                   child: Text(
                     state.errorText!,
                     style: const TextStyle(color: Colors.red, fontSize: 12),
                   ),
                 ),
             ],
           );
         },
       );

  @override
  FormFieldState<String> createState() =>
      _CustomDropdownEthnicGroupFieldState();
}

class _CustomDropdownEthnicGroupFieldState extends FormFieldState<String> {
  bool _isOptionsVisible = false;
  final LayerLink _layerLink = LayerLink();

  // Override to get access to the widget's properties
  @override
  GenderDropDown get widget => super.widget as GenderDropDown;

  void _toggleOptionsVisibility() {
    setState(() {
      _isOptionsVisible = !_isOptionsVisible;
    });
    // When the dropdown closes, re-validate if autovalidateMode is onUserInteraction
    if (!_isOptionsVisible &&
        widget.autovalidateMode == AutovalidateMode.onUserInteraction) {
      validate(); // Trigger validation
    }
  }

  @override
  void didChange(String? value) {
    super.didChange(
      value,
    ); // Important: Call super to update FormField's internal value
    // No need to set RxString here, it's done in the builder's onTap when an item is selected.
  }

  @override
  void initState() {
    super.initState();
    // Initialize the FormField's value from the RxString when the state is created
    setValue(
      widget.selectedValueRx.value.isNotEmpty
          ? widget.selectedValueRx.value
          : null,
    );
  }

  // Optional: If you need to react to external changes to the RxString (e.g., form reset externally)
  // @override
  // void didUpdateWidget(covariant CustomDropdownEthnicGroup oldWidget) {
  //   super.didUpdateWidget(oldWidget);
  //   if (widget.selectedValueRx.value != oldWidget.selectedValueRx.value) {
  //     setValue(widget.selectedValueRx.value.isNotEmpty ? widget.selectedValueRx.value : null);
  //   }
  // }
}
