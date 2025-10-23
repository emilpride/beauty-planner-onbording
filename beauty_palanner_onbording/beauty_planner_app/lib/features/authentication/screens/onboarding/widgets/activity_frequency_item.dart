import 'package:flutter/material.dart';

class ActivityFrequencyItem extends StatelessWidget {
  final String activity;
  final String frequency;
  final VoidCallback onTap;

  const ActivityFrequencyItem({
    super.key,
    required this.activity,
    required this.frequency,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.all(0),
      title: Text(
        activity,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            frequency.split(' ')[1] == '1'
                ? frequency.replaceFirst('1 ', '')
                : frequency,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.deepPurple,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
        ],
      ),
      onTap: onTap,
    );
  }
}
