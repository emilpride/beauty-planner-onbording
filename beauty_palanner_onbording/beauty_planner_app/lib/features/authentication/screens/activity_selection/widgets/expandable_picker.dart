// import 'package:flutter/material.dart';
// import 'package:iconsax/iconsax.dart';

// import '../../../../../utils/constants/colors.dart';

// class ExpandablePicker<T> extends StatefulWidget {
//   final String title;
//   final List<T> items;
//   final T? selectedItem;
//   final TextEditingController searchController;
//   final ValueChanged<T> onItemSelected;
//   final Widget Function(T item) itemBuilder;
//   final bool Function(T item, String query) filterLogic;

//   const ExpandablePicker({
//     super.key,
//     required this.title,
//     required this.items,
//     this.selectedItem,
//     required this.onItemSelected,
//     required this.itemBuilder,
//     required this.searchController,
//     required this.filterLogic,
//   });

//   @override
//   _ExpandablePickerState<T> createState() => _ExpandablePickerState<T>();
// }

// class _ExpandablePickerState<T> extends State<ExpandablePicker<T>> {
//   bool _isExpanded = false;
//   String _searchQuery = '';
//   late List<T> _filteredItems;

//   @override
//   void initState() {
//     super.initState();
//     _filteredItems = widget.items;
//     widget.searchController.addListener(_onSearchChanged);
//   }

//   @override
//   void dispose() {
//     widget.searchController.removeListener(_onSearchChanged);
//     super.dispose();
//   }

//   void _onSearchChanged() {
//     setState(() {
//       _searchQuery = widget.searchController.text;
//       _filteredItems =
//           widget.items
//               .where((item) => widget.filterLogic(item, _searchQuery))
//               .toList();
//     });
//   }

//   void _toggleExpand() {
//     setState(() {
//       _isExpanded = !_isExpanded;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     // Determine the initially displayed items when collapsed
//     final collapsedItems =
//         widget.selectedItem != null
//             ? ([
//               widget.selectedItem!,
//               ...widget.items.where((i) => i != widget.selectedItem!).take(3),
//             ]).toList()
//             : widget.items.take(4).toList();

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,

//       children: [
//         Text(
//           ' ${widget.title}',
//           style: const TextStyle(
//             fontSize: 14,
//             fontWeight: FontWeight.w700,
//             color: AppColors.textPrimary,
//           ),
//         ),
//         const SizedBox(height: 8),
//         AnimatedSize(
//           duration: const Duration(milliseconds: 300),
//           curve: Curves.easeInOut,
//           child: Container(
//             padding: const EdgeInsets.all(8),
//             decoration: BoxDecoration(
//               color: Colors.grey.shade100,
//               borderRadius: BorderRadius.circular(16),
//               border: Border.all(
//                 color: _isExpanded ? AppColors.primary : Colors.grey.shade300,
//               ),
//             ),
//             child: Column(
//               children: [
//                 // Search field and expand/collapse icon
//                 Row(
//                   children: [
//                     Expanded(
//                       child: AnimatedSwitcher(
//                         duration: const Duration(milliseconds: 200),
//                         child:
//                             _isExpanded
//                                 ? TextField(
//                                   controller: widget.searchController,
//                                   decoration: InputDecoration(
//                                     hintText: 'Search...',
//                                     prefixIcon: const Icon(
//                                       Iconsax.search_normal,
//                                     ),
//                                     isDense: true,
//                                     border: OutlineInputBorder(
//                                       borderRadius: BorderRadius.circular(12),
//                                       borderSide: BorderSide.none,
//                                     ),
//                                     filled: true,
//                                     fillColor: AppColors.light,
//                                     enabledBorder: OutlineInputBorder(
//                                       borderRadius: BorderRadius.circular(12),
//                                       borderSide: const BorderSide(
//                                         color: AppColors.light,
//                                       ),
//                                     ),
//                                     focusedBorder: OutlineInputBorder(
//                                       borderRadius: BorderRadius.circular(12),
//                                       borderSide: const BorderSide(
//                                         color: AppColors.light,
//                                       ),
//                                     ),
//                                   ),
//                                 )
//                                 : Wrap(
//                                   spacing: 12,
//                                   runSpacing: 12,
//                                   crossAxisAlignment: WrapCrossAlignment.center,
//                                   children:
//                                       collapsedItems
//                                           .map(
//                                             (item) => GestureDetector(
//                                               onTap: () {
//                                                 widget.onItemSelected(item);
//                                                 if (_isExpanded) {
//                                                   _toggleExpand();
//                                                 }
//                                               },
//                                               child: widget.itemBuilder(item),
//                                             ),
//                                           )
//                                           .toList(),
//                                 ),
//                       ),
//                     ),
//                     IconButton(
//                       icon: Icon(
//                         _isExpanded
//                             ? Icons.keyboard_arrow_up
//                             : Icons.keyboard_arrow_down,
//                       ),
//                       onPressed: _toggleExpand,
//                     ),
//                   ],
//                 ),
//                 // Grid of items
//                 // if (_isExpanded) const SizedBox(height: 12),
//                 if (_isExpanded) const Divider(thickness: 0.5),
//                 if (_isExpanded)
//                   Wrap(
//                     spacing: 12,
//                     runSpacing: 12,
//                     children:
//                         (_isExpanded ? _filteredItems : collapsedItems)
//                             .map(
//                               (item) => GestureDetector(
//                                 onTap: () {
//                                   widget.onItemSelected(item);
//                                   if (_isExpanded) _toggleExpand();
//                                 },
//                                 child: widget.itemBuilder(item),
//                               ),
//                             )
//                             .toList(),
//                   ),
//               ],
//             ),
//           ),
//         ),
//       ],
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../../utils/constants/colors.dart';

class ExpandablePicker<T> extends StatefulWidget {
  final String title;
  final Map<String, T> items; // Changed from List<T> to Map<String, T>
  final T? selectedItem;
  final TextEditingController searchController;
  final ValueChanged<T> onItemSelected;
  final Widget Function(T item) itemBuilder;
  final bool Function(String key, T value, String query)? filterLogic;
  final Comparator<String>? sortKeys; // Optional sorting

  const ExpandablePicker({
    super.key,
    required this.title,
    required this.items,
    this.selectedItem,
    required this.onItemSelected,
    required this.itemBuilder,
    required this.searchController,
    this.filterLogic,
    this.sortKeys,
  });

  @override
  _ExpandablePickerState<T> createState() => _ExpandablePickerState<T>();
}

class _ExpandablePickerState<T> extends State<ExpandablePicker<T>> {
  bool _isExpanded = false;
  String _searchQuery = '';
  late List<String> _sortedKeys;
  late List<String> _filteredKeys;

  @override
  void initState() {
    super.initState();
    _updateSortedKeys();
    _updateFilteredKeys();
    widget.searchController.addListener(_onSearchChanged);
  }

  @override
  void didUpdateWidget(covariant ExpandablePicker<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.items != widget.items) {
      _updateSortedKeys();
      _updateFilteredKeys();
    }
  }

  @override
  void dispose() {
    widget.searchController.removeListener(_onSearchChanged);
    super.dispose();
  }

  void _updateSortedKeys() {
    _sortedKeys = widget.items.keys.toList();
    if (widget.sortKeys != null) {
      _sortedKeys.sort(widget.sortKeys);
    }
  }

  void _updateFilteredKeys() {
    if (_searchQuery.isEmpty) {
      _filteredKeys = _sortedKeys;
    } else {
      _filteredKeys =
          _sortedKeys.where((key) {
            final value = widget.items[key] as T;
            return widget.filterLogic?.call(key, value, _searchQuery) ??
                key.toLowerCase().contains(_searchQuery.toLowerCase());
          }).toList();
    }
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = widget.searchController.text;
      _updateFilteredKeys();
    });
  }

  void _toggleExpand() {
    setState(() {
      _isExpanded = !_isExpanded;
    });
  }

  List<String> getCollapsedKeys() {
    if (widget.selectedItem == null) {
      return _sortedKeys.take(4).toList();
    }

    final selectedKey =
        widget.items.entries
            .firstWhere(
              (entry) => entry.value == widget.selectedItem,
              orElse: () => MapEntry('', widget.selectedItem as T),
            )
            .key;

    final others = _sortedKeys.where((k) => k != selectedKey).take(3).toList();
    return [selectedKey, ...others];
  }

  @override
  Widget build(BuildContext context) {
    final collapsedKeys = getCollapsedKeys();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          ' ${widget.title}',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color:
                    _isExpanded ? AppColors.primary : const Color(0xFFADB2D7),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child:
                            _isExpanded
                                ? TextField(
                                  controller: widget.searchController,
                                  decoration: InputDecoration(
                                    hintText: 'Search...',
                                    prefixIcon: const Icon(
                                      Iconsax.search_normal,
                                    ),
                                    isDense: true,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: AppColors.light,
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: AppColors.light,
                                      ),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: AppColors.light,
                                      ),
                                    ),
                                  ),
                                )
                                : Wrap(
                                  spacing: 12,
                                  runSpacing: 12,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children:
                                      collapsedKeys.map((key) {
                                        final item = widget.items[key] as T;
                                        return GestureDetector(
                                          onTap: () {
                                            widget.onItemSelected(item);
                                            if (_isExpanded) _toggleExpand();
                                          },
                                          child: widget.itemBuilder(item),
                                        );
                                      }).toList(),
                                ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        _isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                      ),
                      onPressed: _toggleExpand,
                    ),
                  ],
                ),
                if (_isExpanded) const Divider(thickness: 0.5),
                if (_isExpanded)
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children:
                        _filteredKeys.map((key) {
                          final item = widget.items[key] as T;
                          return GestureDetector(
                            onTap: () {
                              widget.onItemSelected(item);
                              if (_isExpanded) _toggleExpand();
                            },
                            child: widget.itemBuilder(item),
                          );
                        }).toList(),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
