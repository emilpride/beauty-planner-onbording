import 'dart:developer';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import 'package:image_picker/image_picker.dart';

import '../../../common/widgets/loaders/loaders.dart';
import '../../../common/widgets/loaders/progress_dialog.dart';
import '../../../data/models/activity_model.dart';
import '../../../data/models/category_model.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/authentication/authentication_repository.dart';
import '../../../data/repositories/user/user_repository.dart';
import '../../../utils/constants/colors.dart';
import '../../../utils/constants/image_strings.dart';
import '../../../utils/constants/sizes.dart';
import '../../../utils/network/network_manager.dart';
import '../../../utils/validators/validation.dart';
import '../../authentication/screens/login/login.dart';

class UserController extends GetxController {
  static UserController get instance => Get.find();

  final profileLoading = false.obs;
  Rx<UserModel> user = UserModel.empty().obs;

  RxInt x = 0.obs;
  XFile? imageFile;
  final isReady = true.obs; // To trigger initial animations

  final hidePassword = true.obs;
  final imageUploading = false.obs;
  final userName = TextEditingController();
  final userEmail = TextEditingController();
  final verifyPassword = TextEditingController();
  final userRepository = Get.put(UserRepository());
  final reAuthPassword = TextEditingController();
  Rx<DateTime?> birthDate = Rx<DateTime?>(null);

  final selectedGender = RxString('');
  final List<String> genders = ['Male', 'Female'];

  RxBool dailyReminder = false.obs;
  RxBool activityReminder = false.obs;
  RxBool vacationMode = false.obs;

  Rx<TimeOfDay> morningStartsAt = TimeOfDay.now().obs;
  Rx<TimeOfDay> afternoonStartsAt = TimeOfDay.now().obs;
  Rx<TimeOfDay> eveningStartsAt = TimeOfDay.now().obs;
  Rx<TimeOfDay> reminderTime = TimeOfDay.now().obs;
  RxString firstDayOfWeek = 'Monday'.obs;
  RxInt theme = 1.obs;
  RxInt assistant = 0.obs;

  RxString selectedLanguageCode = ''.obs;
  GlobalKey<FormState> editAccountFormKey = GlobalKey<FormState>();
  GlobalKey<FormState> reAuthFormKey = GlobalKey<FormState>();

  Future<void> initialize() async {
    await fecthUserRecord();
    userEmail.text = user.value.email;
    userName.text = user.value.name;
    selectedGender.value = user.value.gender == 1 ? 'Male' : 'Female';
    user.value.dateOfBirth != null
        ? birthDate.value = user.value.dateOfBirth!
        : null;
    selectedLanguageCode.value = user.value.languageCode;
    dailyReminder.value = user.value.dailyReminder;
    activityReminder.value = user.value.activityReminder;
    vacationMode.value = user.value.vacationMode;
    morningStartsAt.value = user.value.morningStartsAt;
    afternoonStartsAt.value = user.value.afternoonStartsAt;
    eveningStartsAt.value = user.value.eveningStartsAt;
    reminderTime.value = user.value.reminderTime;
    firstDayOfWeek.value = user.value.firstDayOfWeek;
    theme.value = user.value.theme;
    assistant.value = user.value.assistant;
  }

  //save user record from any registration provider
  // Future<void> saveUserRecord(UserCredential? userCredentials) async {
  //   try {
  //     //update Rx user then check if user data is already stored.
  //     await fecthUserRecord();

  //     if (user.value.id.isEmpty) {
  //       if (userCredentials != null) {
  //         //map data
  //         final user = UserModel(
  //           id: userCredentials.user!.uid,
  //           name: userCredentials.user!.displayName ?? '',
  //           email: userCredentials.user!.email ?? '',
  //           profilePicture: userCredentials.user!.photoURL ?? '',
  //           languageCode:
  //               AppLocalizations.supportedLocales.contains(
  //                     Locale(
  //                       WidgetsBinding
  //                           .instance
  //                           .platformDispatcher
  //                           .locale
  //                           .languageCode,
  //                     ),
  //                   )
  //                   ? WidgetsBinding
  //                       .instance
  //                       .platformDispatcher
  //                       .locale
  //                       .languageCode
  //                   : 'en',
  //         );

  //         //save data
  //         await userRepository.saveUserRecord(user);
  //       }
  //     }
  //   } catch (c) {
  //     Loaders.warningSnackBar(
  //       title: 'Data not saved',
  //       message:
  //           'Something went wrong while saving your information. You can re-save your data in your profile.',
  //     );
  //   }
  // }

  /// Deletes the user account after handling re-authentication based on the provider.
  void deleteUserAccount() async {
    Get.dialog(
      const ProgressDialog(title: 'Deleting Account...'),
      barrierDismissible: false,
    );
    try {
      // Check network
      final isConnected = await NetworkManager.instance.isConnected();
      if (!isConnected) {
        Get.back();
        Loaders.warningSnackBar(title: 'No Internet Connection');
        return;
      }

      final auth = AuthenticationRepository.instance;
      final currentUser = auth.authUser;

      if (currentUser == null) {
        Get.back();
        Loaders.errorSnackBar(title: 'Error', message: 'User not logged in.');
        Get.offAll(() => const LoginScreen()); // Redirect if user somehow null
        return;
      }

      final provider = currentUser.providerData.map((e) => e.providerId).first;
      // final userId = currentUser.uid; // Not needed directly, auth.deleteAccount handles it

      if (provider == 'password') {
        // Stop the initial loader, prompt for password
        Get.back();
        // Show a dialog to collect the password
        _showPasswordConfirmationDialog();
      }
      // else if (provider == 'google.com' || provider == 'facebook.com') {
      //   // Re-authenticate with the social provider
      //   AuthCredential credential;
      //   if (provider == 'google.com') {
      //     final googleUser = await GoogleSignIn().signIn();
      //     if (googleUser == null) {
      //       Get.back();
      //       throw Exception("Google sign in aborted by user.");
      //     }
      //     final googleAuth = await googleUser.authentication;
      //     credential = GoogleAuthProvider.credential(
      //       accessToken: googleAuth.accessToken,
      //       idToken: googleAuth.idToken,
      //     );
      //   } else {
      //     // facebook.com
      //     final result = await FacebookAuth.instance.login();
      //     if (result.status != LoginStatus.success) {
      //       Get.back();
      //       throw Exception("Facebook login failed: ${result.message}");
      //     }
      //     final accessToken = result.accessToken?.tokenString;
      //     if (accessToken == null) {
      //       Get.back();
      //       throw Exception("Could not retrieve Facebook access token.");
      //     }
      //     credential = FacebookAuthProvider.credential(accessToken);
      //   }
      //   // Reauthenticate
      //   await currentUser.reauthenticateWithCredential(credential);
      //   // Delete account (Auth repo handles Firestore deletion)
      //   await auth.deleteAccount();
      //   // Stop loader
      //   Get.back();
      //   // Show success message
      //   Loaders.successSnackBar(
      //     title: 'Account Deleted',
      //     message: 'Your account has been successfully deleted.',
      //   );
      //   // Logout and navigate
      //   await auth.logout(); // Use the logout method from Auth repo
      //   Get.offAll(() => const LoginScreen());
      // }
      else {
        // Handle other potential providers if necessary (e.g., Apple Sign In)
        Get.back();
        Loaders.errorSnackBar(
          title: 'Unsupported Provider',
          message:
              'Account deletion for this provider ($provider) is not supported yet.',
        );
      }
    } on FirebaseAuthException catch (e) {
      Get.back();
      // Handle specific Firebase errors
      if (e.code == 'requires-recent-login') {
        Loaders.errorSnackBar(
          title: 'Recent Login Required',
          message:
              'This action requires you to have logged in recently. Please log out and log back in before deleting your account.',
        );
      } else {
        Loaders.errorSnackBar(
          title: 'Authentication Error',
          message: e.message ?? 'Failed to re-authenticate or delete account.',
        );
      }
    } catch (e) {
      Get.back();
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'An error occurred: ${e.toString()}',
      );
    }
  }

  /// Helper function for password re-auth and deletion. Triggered after password entry.
  Future<void> _deleteAccountAfterPasswordReauth(String password) async {
    Get.dialog(
      const ProgressDialog(title: 'Deleting Account...'),
      barrierDismissible: false,
    );
    try {
      final auth = AuthenticationRepository.instance;

      // Re-authenticate with email and password
      // Ensure user.value.email is populated before calling deleteAccountWarningPopup -> deleteUserAccount
      if (user.value.email.isEmpty) {
        await fecthUserRecord(); // Fetch if email somehow missing
      }
      if (user.value.email.isEmpty) {
        throw Exception(
          'User email could not be retrieved for re-authentication.',
        );
      }
      await auth.reAuthWithEmailAndPassword(user.value.email, password);

      // Delete account (Auth repo handles Firestore deletion)
      await auth.deleteAccount();

      //remove user and pet records from firestore
      // for (String petId in user.value.petIds) {
      //   await PetRepository.instance.removePetRecord(petId);
      // }

      await userRepository.removeUserRecord(user.value.id);

      // Stop loader
      Get.back();
      verifyPassword.clear(); // Clear password field

      // Show success message
      Loaders.customToast(
        message: 'Your account has been successfully deleted.',
      );

      // Logout and navigate
      await auth.logout(); // Use the logout method from Auth repo
      Get.offAll(() => const LoginScreen());
    } on FirebaseAuthException catch (e) {
      Get.back();
      verifyPassword.clear(); // Clear password field on error too
      if (e.code == 'wrong-password') {
        Loaders.errorSnackBar(
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect. Please try again.',
        );
      } else if (e.code == 'requires-recent-login') {
        // This might happen even with password if login was long ago
        Loaders.errorSnackBar(
          title: 'Recent Login Required',
          message:
              'This action requires you to have logged in recently. Please log out and log back in before deleting your account.',
        );
      } else {
        Loaders.errorSnackBar(
          title: 'Authentication Error',
          message: e.message ?? 'Failed to re-authenticate or delete account.',
        );
      }
    } catch (e) {
      Get.back();
      verifyPassword.clear(); // Clear password field on error too
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'An error occurred: ${e.toString()}',
      );
    }
  }

  Future<void> updateActivitiesOrder(
    List<ActivityModel> newActivitiesList,
  ) async {
    user.update((val) {
      val?.activities = newActivitiesList;
    });
    // Upload to Firebase
    final json = {
      'Activities': user.value.activities.map((e) => e.toJson()).toList(),
    };
    await userRepository.updateSingleField(json);
    log('Activities order updated');
  }

  void _showPasswordConfirmationDialog() {
    // Clear previous password attempt
    verifyPassword.clear();

    showModalBottomSheet(
      context: Get.context!,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Center(
                child: Text(
                  'Re-authenticate',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: AppSizes.spaceBtnItems),
              const Text(
                'Please enter your current password to continue.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSizes.spaceBtnItems),
              // Use Obx for password visibility toggle if needed, similar to login/signup
              Form(
                key: reAuthFormKey, // Use the existing key
                child: Obx(
                  // Use Obx to react to hidePassword changes
                  () => TextFormField(
                    validator:
                        (value) =>
                            MyValidator.validateEmptyText('Password', value),
                    controller: reAuthPassword,
                    obscureText: hidePassword.value,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: const TextStyle(
                        fontSize: 15,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w400,
                      ),
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(13),
                        child: SvgPicture.asset(
                          AppImages.lock,
                          height: 18,
                          width: 18,
                        ),
                      ),
                      suffixIcon: GestureDetector(
                        onTap: () => hidePassword.value = !hidePassword.value,
                        child: Icon(
                          size: 20,
                          color: AppColors.textSecondary,
                          hidePassword.value ? Iconsax.eye : Iconsax.eye_slash,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSizes.spaceBtnSections),
              SizedBox(
                height: 50,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          reAuthPassword.clear(); // Clear password on cancel
                          Get.back();
                        },
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: AppSizes.sm),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (reAuthFormKey.currentState!.validate()) {
                            Get.back(); // Close the dialog
                            _deleteAccountAfterPasswordReauth(
                              reAuthPassword.text.trim(),
                            );
                          }
                        },
                        child: const Text('Confirm'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    ); // Prevent closing by tapping outside
  }

  Future<void> fecthUserRecord() async {
    try {
      profileLoading.value = true;
      final user = await userRepository.fetchUserDetails();
      this.user(user);
    } catch (e) {
      user(UserModel.empty());
    } finally {
      profileLoading.value = false;
    }
  }

  pickProfilePicture() async {
    imageFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 100,
      maxHeight: 512,
      maxWidth: 512,
    );
    x.value++;
  }

  uploadUserProfilePicture() async {
    try {
      if (imageFile != null) {
        imageUploading.value = true;
        final imageUrl = await userRepository.uploadImage(
          'Users/Images/Profile/',
          imageFile!,
        );

        //update user img record
        Map<String, dynamic> json = {'ProfilePicture': imageUrl};
        await userRepository.updateSingleField(json);

        user.value.profilePicture = imageUrl;

        user.refresh();

        imageUploading.value = false;

        Loaders.customToast(message: 'Your Profile Image has been updated!');
      }
    } catch (e) {
      imageUploading.value = false;
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  //update user language
  void updateUserLanguage(String languageCode) async {
    try {
      final json = {'LanguageCode': languageCode};
      await userRepository.updateSingleField(json);
      user.value.languageCode = languageCode;
      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  //update user notification settings
  void updateOnboardingCompletion() async {
    try {
      final json = {'Onboarding2Completed': true};
      await userRepository.updateSingleField(json);
      user.value.onboarding2Completed = true;
      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  //update user notification settings
  void updateUserNotificationSettings() async {
    try {
      final json = {
        'DailyMoodReminder': user.value.dailyMoodReminder,
        'ActivityReminder': user.value.activityReminder,
      };
      await userRepository.updateSingleField(json);
      user.value.dailyMoodReminder = user.value.dailyMoodReminder;
      user.value.activityReminder = user.value.activityReminder;

      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  //update user currency
  void updateUserCurrency(String currency) async {
    try {
      final json = {'Currency': currency};
      await userRepository.updateSingleField(json);
      user.value.currency = currency;
      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  //update user category list
  void updateUserCategories(List<CategoryModel> categories) async {
    try {
      final json = {'Categories': categories.map((e) => e.toJson()).toList()};
      await userRepository.updateSingleField(json);
      user.value.categories = categories;
      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void deleteUserActivity(ActivityModel activity, bool keepHistory) async {
    try {
      user.value.keepActivityHistory[activity.id] = keepHistory;
      if (keepHistory) {
        activity.activeStatus = false;
        activity.lastModifiedAt = DateTime.now();
        // Move to deletedActivities for record-keeping
        user.value.deletedActivities.add(activity);
      }
      user.value.activities.removeWhere((e) => e.id == activity.id);
      user.refresh();

      final json = {
        'KeepActivityHistory': user.value.keepActivityHistory,
        'DeletedActivities':
            user.value.deletedActivities.map((e) => e.toJson()).toList(),
        'Activities': user.value.activities.map((e) => e.toJson()).toList(),
      };
      await userRepository.updateSingleField(json);
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void addUserActivities(List<ActivityModel> newActivities) async {
    try {
      final updatedActivities =
          newActivities.where((activity) => activity.activeStatus).toList();

      // Update the user model
      user.value.activities.addAll(updatedActivities);
      user.refresh();

      // Upload to Firebase
      final json = {
        'Activities': user.value.activities.map((e) => e.toJson()).toList(),
      };
      await userRepository.updateSingleField(json);
      AuthenticationRepository.instance.initialize();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void updateUserActivity(ActivityModel activity) async {
    try {
      user.value.activities.removeWhere((e) => e.id == activity.id);
      user.value.activities.add(activity);
      user.refresh();

      // Upload to Firebase
      final json = {
        'Activities': user.value.activities.map((e) => e.toJson()).toList(),
      };
      await userRepository.updateSingleField(json);
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void deactivateUserAccount() async {
    try {
      final json = {'AccountDeactivated': true};
      await userRepository.updateSingleField(json);
      user.value.accountDeactivated = true;
      user.refresh();
      Loaders.customToast(message: 'Your account has been deactivated.');
      AuthenticationRepository.instance.logout();
      AuthenticationRepository.instance.screenRedirect();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void updateSingleField(Map<String, dynamic> json) async {
    try {
      await userRepository.updateSingleField(json);
      user.refresh();
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }

  void updateUserProfile() async {
    try {
      final json = {
        'Name': userName.text,
        'Gender': selectedGender.value == 'Male' ? 1 : 2,
        'DateOfBirth': birthDate.value?.toIso8601String(),
      };
      await userRepository.updateSingleField(json);
      await uploadUserProfilePicture();
      user.value.name = userName.text;
      user.value.gender = selectedGender.value == 'Male' ? 1 : 2;
      user.value.dateOfBirth = birthDate.value;
      x.value++;
      user.refresh();
      Loaders.customToast(message: 'Your profile has been updated.');
    } catch (e) {
      Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
    }
  }
}
