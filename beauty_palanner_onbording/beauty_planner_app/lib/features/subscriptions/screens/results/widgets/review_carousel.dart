import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../common/widgets/images/rounded_image.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../authentication/models/review_model.dart';

class ReviewCarousel extends StatefulWidget {
  const ReviewCarousel({super.key});

  @override
  State<ReviewCarousel> createState() => _ReviewCarouselState();
}

class _ReviewCarouselState extends State<ReviewCarousel> {
  late PageController _pageController;
  final List<ReviewModel> reviews = ReviewModel.reviews();
  final double _viewportFraction =
      0.5; // Adjust this to control how much of the side items are visible

  @override
  void initState() {
    super.initState();
    _pageController = PageController(
      viewportFraction: _viewportFraction, // Controls the size of each page
      initialPage: 1, // Start at the first item
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 350, // Set a fixed height for the carousel
      child: PageView.builder(
        controller: _pageController,
        itemCount: reviews.length,
        itemBuilder: (context, index) {
          // You can add some scaling or animation here based on the page position
          // For a basic carousel, just return the ReviewCard
          return AnimatedBuilder(
            animation: _pageController,
            builder: (context, child) {
              double value = 1.0;
              if (_pageController.position.haveDimensions) {
                value = _pageController.page! - index;
                value = (1 - (value.abs() * 0.3)).clamp(
                  0.0,
                  1.0,
                ); // Scale effect
              }
              return Center(
                child: SizedBox(
                  height:
                      // Curves.easeOut.transform(value) *
                      310, // Adjust height based on scale
                  // width:
                  //     Curves.easeOut.transform(value) *
                  //     MediaQuery.of(context).size.width *
                  //     _viewportFraction, // Adjust width based on scale
                  child: child,
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.sm / 2,
              ), // Add some horizontal padding between cards
              child: ReviewCard(reviewModel: reviews[index]),
            ),
          );
        },
      ),
    );
  }
}

class ReviewCard extends StatelessWidget {
  const ReviewCard({super.key, required this.reviewModel});

  final ReviewModel reviewModel;

  @override
  Widget build(BuildContext context) {
    return RoundedContainer(
      width: 140,
      padding: const EdgeInsets.all(AppSizes.sm),
      shadow: true,
      child: Column(
        children: [
          RoundedImage(imageUrl: reviewModel.image, isNetworkImage: false),
          const SizedBox(height: AppSizes.sm),
          Row(
            children: [
              Text(
                reviewModel.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: AppSizes.sm),
              SvgPicture.asset(AppImages.verified),
              const SizedBox(width: AppSizes.xs),
              const Text(
                'Verified',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const Opacity(opacity: 0.5, child: Divider()),
          Row(
            children: [
              SvgPicture.asset(AppImages.reviewStars),
              const SizedBox(width: AppSizes.sm),
              const Text(
                '5.0 rating',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          Flexible(child: Text(reviewModel.review)),
        ],
      ),
    );
  }
}
