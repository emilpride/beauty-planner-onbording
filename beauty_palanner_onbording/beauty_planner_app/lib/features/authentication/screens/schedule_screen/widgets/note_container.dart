import 'package:flutter/material.dart';

import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';

class NoteContainer extends StatelessWidget {
  final ActivityModel activityModel;
  const NoteContainer({super.key, required this.activityModel});

  @override
  Widget build(BuildContext context) {
    activityModel.noteController.text = activityModel.note!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '  Note',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 50),
          padding: const EdgeInsets.all(0),
          color: Colors.transparent,
          child: TextField(
            controller: activityModel.noteController,
            keyboardType: TextInputType.multiline,
            maxLines: null, // Allows for unlimited lines

            decoration: InputDecoration(
              hintText: 'Type the name',
              filled: true,
              fillColor: AppColors.light,
              hintStyle: TextStyle(color: Colors.grey[600]!),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Color(0xFF8A60FF),
                  width: 1.5,
                ),
              ),
            ),
            style: TextStyle(
              color:
                  Colors.grey[800], // Changed text color for better visibility
              fontSize: 15,
              fontWeight: FontWeight.w400,
            ),
            onChanged: (text) {
              activityModel.note = text;
              activityModel.noteController.text = text;
            },
          ),
        ),
      ],
    );
  }
}
