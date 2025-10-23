import '../../../utils/constants/image_strings.dart';

class ReviewModel {
  final String name;
  final String image;
  final String review;

  ReviewModel({required this.name, required this.image, required this.review});

  static List<ReviewModel> reviews() => <ReviewModel>[
    ReviewModel(
      name: 'Mira',
      image: AppImages.review1,
      review:
          'This service is a real find! Thanks for the accuracy and professionalism!',
    ),
    ReviewModel(
      name: 'Aisha',
      image: AppImages.review2,
      review: 'I\'m stoked! The results have been a source of inspiration.',
    ),
    ReviewModel(
      name: 'Emily',
      image: AppImages.review3,
      review: 'I’m more beautiful than the average in my country!',
    ),
  ];
}
