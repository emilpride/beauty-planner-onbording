import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:io';
import 'dart:math';
import 'dart:ui';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../../../routes/routes.dart';
import '../../../common/widgets/loaders/loaders.dart';
import '../../../features/app/controllers/activity_controller.dart';
import '../../../features/app/controllers/calendar_controller.dart';
import '../../../features/app/controllers/home_controller.dart';
import '../../../features/app/controllers/mood_controller.dart';
import '../../../features/authentication/controllers/activity_selection/choose_activity_controller.dart';
import '../../../features/authentication/screens/miscellaneous/no_internet_screen.dart';
import '../../../features/authentication/screens/schedule_screen/create_schedule_screen.dart';
import '../../../features/authentication/screens/signup/verify_email.dart';
import '../../../features/authentication/screens/login/login.dart';
import '../../../features/personalization/controllers/ai_analysis_controller.dart';
import '../../../features/personalization/controllers/biometric_controller.dart';
import '../../../features/personalization/controllers/user_controller.dart';
import '../../../utils/exceptions/exceptions.dart';
import '../../../utils/exceptions/format_exceptions.dart';
import '../../../utils/exceptions/platform_exceptions.dart';
import '../../../utils/local_storage/storage_utility.dart';
import '../../../utils/network/network_manager.dart';
import '../notifications/notifications_repository.dart';
import '../subscriptions/subscriptions_repository.dart';
import '../user/user_repository.dart';

class AuthenticationRepository extends GetxController {
  static AuthenticationRepository get instance => Get.find();

  //variables
  final _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  // For Google Sign-In
  GoogleSignInAccount? _currentGoogleUser;
  bool _isGoogleSingInInitialized = false;

  final userController = Get.put(UserController());
  final subscriptionRepository = Get.put(SubscriptionsRepository());
  final aiAnalysisController = Get.put(AIAnalysisController());
  final homeController = Get.put(HomeScreenController());
  final activityController = Get.put(ActivityController());
  final calendarController = Get.put(CalendarController());
  final notificationsRepository = Get.put(NotificationsRepository());
  final chooseActivitiesController = Get.put(ChooseActivitiesController());

  final moodController = Get.put(MoodController());
  // final weightController = Get.put(WeightController());

  //Get authenticated user
  User? get authUser => _auth.currentUser;

  //called from main.dart on app launch
  @override
  void onReady() {
    FlutterNativeSplash.remove();
    screenRedirect();
  }

  //function to show relevant Screen
  screenRedirect() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      Get.offAll(() => const NoInternetScreen(), transition: Transition.fadeIn);
    } else {
      final user = _auth.currentUser;

      if (user != null) {
        if (user.emailVerified) {
          await LocalStorage.init(user.uid);
          final storage = LocalStorage.instance();
          await userController.initialize();
          storage.writeData('User', userController.user.value.toJson());

          // Initialize biometric controller
          final biometricController = Get.put(BiometricController());

          // Check if biometric is enabled
          if (biometricController.isAnyBiometricEnabled) {
            final authenticated =
                await biometricController.authenticateOnAppLaunch();

            if (!authenticated) {
              // User failed biometric authentication
              Loaders.customToast(
                message:
                    'Authentication Failed, Biometric authentication is required to access the app',
              );
              // await signOut();
              biometricController.authenticateOnAppLaunch();
              return;
            }
          }

          await aiAnalysisController.initialize();
          await activityController.ensureInitialized();
          // RevenueCat subscriptions are not supported on web; skip initialization
          if (!kIsWeb) {
            await subscriptionRepository.initialize();
          }
          chooseActivitiesController.reinitialize();
          await moodController.ensureInitialized();

          Get.updateLocale(Locale(userController.user.value.languageCode));

          if (!userController.user.value.onboarding2Completed) {
            Get.offAll(
              () => const CreateScheduleScreen(),
              transition: Transition.rightToLeft,
              duration: const Duration(milliseconds: 300),
            );
          }
          if (subscriptionRepository.isSubscribed.value == true) {
            Get.offAllNamed(Routes.app);
          } else if (subscriptionRepository.isSubscribed.value == false &&
              !kIsWeb && Platform.isAndroid &&
              userController.user.value.id == '6eSHNDECwNgJH8iFqqsF8kAzJxI2') {
            Get.offAllNamed(Routes.app);
          } else if (subscriptionRepository.isSubscribed.value == false) {
            // Get.offAll(() => const SubscriptionScreen());
            Get.offAllNamed(Routes.app);
          }
        } else {
          await subscriptionRepository.initialize();
          Get.offAll(() => VerifyEmailScreen(email: _auth.currentUser?.email));
        }
      } else {
        // Route unauthenticated users directly to Sign In (onboarding is handled on the web quiz)
        Get.offAllNamed(Routes.signIn);
      }
    }
  }

  Future<void> initialize() async {
    final user = _auth.currentUser;
    if (user != null) {
      await LocalStorage.init(user.uid);
      final storage = LocalStorage.instance();

      await userController.initialize();
      await storage.writeData('User', userController.user.value.toJson());
      await aiAnalysisController.initialize();
      await activityController.refreshData();
      chooseActivitiesController.reinitialize();

      // Get.updateLocale(Locale(userController.user.value.languageCode));

      await subscriptionRepository.initialize();

      await moodController.initialize();
      // await weightController.initialize();
    }
  }

  String generateNonce([int length = 32]) {
    final charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(
      length,
      (_) => charset[random.nextInt(charset.length)],
    ).join();
  }

  String sha256ofString(String input) {
    final bytes = utf8.encode(input);
    return sha256.convert(bytes).toString();
  }

  Map<String, dynamic> parseJwt(String token) {
    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');
    final payload = base64Url.normalize(parts[1]);
    final decoded = utf8.decode(base64Url.decode(payload));
    return json.decode(decoded) as Map<String, dynamic>;
  }

  //login
  Future<UserCredential> loginWithEmailAndPassword(
    String email,
    String password,
  ) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  //Register
  Future<UserCredential> registerWithEmailAndPassword(
    String email,
    String password,
  ) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<bool> checkIfUserExists(String email) async {
    final QuerySnapshot result =
        await _db
            .collection('Users')
            .where('Email', isEqualTo: email)
            .limit(1)
            .get();

    return result.docs.isNotEmpty; // Returns true if user exists
  }

  // Initialize GoogleSignIn instance (call this once in your app initialization)
  Future<void> initializeGoogleSignIn() async {
    if (_isGoogleSingInInitialized) return;

    final GoogleSignIn signIn = GoogleSignIn.instance;

    await signIn.initialize();

    // Listen to authentication events
    signIn.authenticationEvents.listen(
      _handleAuthenticationEvent,
      onError: _handleAuthenticationError,
    );

    // Attempt lightweight authentication (replaces signInSilently)
    // Note: This may or may not return a Future depending on platform
    // signIn.attemptLightweightAuthentication();

    _isGoogleSingInInitialized = true;
  }

  void _handleAuthenticationEvent(GoogleSignInAuthenticationEvent event) {
    switch (event) {
      case GoogleSignInAuthenticationEventSignIn():
        _currentGoogleUser = event.user;
        break;
      case GoogleSignInAuthenticationEventSignOut():
        _currentGoogleUser = null;
        break;
    }
  }

  void _handleAuthenticationError(Object error) {
    print('Google Sign-In error: $error');
    _currentGoogleUser = null;
  }

  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Web: use Firebase Auth popup directly (simpler and reliable on web)
      if (kIsWeb) {
        final credential = await _auth.signInWithPopup(GoogleAuthProvider());
        return credential;
      }

      // Ensure GoogleSignIn is initialized
      if (!_isGoogleSingInInitialized) {
        await initializeGoogleSignIn();
      }

      final GoogleSignIn signIn = GoogleSignIn.instance;

      // Sign out to force account selection (replaces the old signOut call)
      await signIn.disconnect();

      // Check if the platform supports authenticate method
      if (signIn.supportsAuthenticate()) {
        // Use the new authenticate method (replaces signIn)
        _currentGoogleUser = await signIn.authenticate();
      } else {
        // For platforms that don't support authenticate (like web)
        throw PlatformException(
          code: 'unsupported_platform',
          message: 'This platform requires platform-specific authentication UI',
        );
      }

      if (_currentGoogleUser == null) {
        return null; // User canceled sign-in
      }

      // Now handle authorization separately from authentication
      // Check if we already have authorization for basic scopes
      final GoogleSignInClientAuthorization? existingAuth =
          await _currentGoogleUser!.authorizationClient.authorizationForScopes(
            [],
          );

      if (existingAuth == null) {
        // Request authorization (this may show UI)
        await _currentGoogleUser!.authorizationClient.authorizeScopes([]);
      }

      // Get the ID token for Firebase
      final Map<String, String>? headers = await _currentGoogleUser!
          .authorizationClient
          .authorizationHeaders([]);

      if (headers == null) {
        throw Exception('Failed to get authorization headers');
      }

      // Extract tokens - the exact method may vary based on what Firebase expects
      // You might need to adjust this based on your specific Firebase setup
      final String? idToken = headers['Authorization']?.replaceFirst(
        'Bearer ',
        '',
      );

      if (idToken == null) {
        throw Exception('Failed to get ID token from authorization headers');
      }

      // Create Firebase credential with the ID token
      final AuthCredential credential = GoogleAuthProvider.credential(
        idToken: idToken,
        // Note: accessToken may not be directly available in the new API
        // Firebase typically only needs the idToken for authentication
      );

      // Sign in with Firebase
      return await _auth.signInWithCredential(credential);
    } on GoogleSignInException catch (e) {
      // Handle the new exception types
      throw _handleGoogleSignInException(e);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again: $e';
    }
  }

  Future<UserCredential?> loginInWithGoogle() async {
    try {
      // Web: use Firebase Auth popup directly
      if (kIsWeb) {
        final credential = await _auth.signInWithPopup(GoogleAuthProvider());
        return credential;
      }

      // Ensure GoogleSignIn is initialized
      if (!_isGoogleSingInInitialized) {
        await initializeGoogleSignIn();
      }

      final GoogleSignIn signIn = GoogleSignIn.instance;

      // Sign out to force account selection
      await signIn.disconnect();

      // Check if the platform supports authenticate method
      if (signIn.supportsAuthenticate()) {
        // Use the new authenticate method
        _currentGoogleUser = await signIn.authenticate();
      } else {
        throw PlatformException(
          code: 'unsupported_platform',
          message: 'This platform requires platform-specific authentication UI',
        );
      }

      if (_currentGoogleUser == null) {
        return null; // User canceled sign-in
      }

      // Check if user exists before proceeding with authorization
      bool userExists = await checkIfUserExists(_currentGoogleUser!.email);
      if (!userExists) {
        await signIn.disconnect(); // Clean up
        return null; // Stop sign-in if user doesn't exist
      }

      // Handle authorization separately
      final GoogleSignInClientAuthorization? existingAuth =
          await _currentGoogleUser!.authorizationClient.authorizationForScopes(
            [],
          );

      if (existingAuth == null) {
        await _currentGoogleUser!.authorizationClient.authorizeScopes([]);
      }

      // Get authorization headers
      final Map<String, String>? headers = await _currentGoogleUser!
          .authorizationClient
          .authorizationHeaders([]);

      if (headers == null) {
        throw Exception('Failed to get authorization headers');
      }

      final String? idToken = headers['Authorization']?.replaceFirst(
        'Bearer ',
        '',
      );

      if (idToken == null) {
        throw Exception('Failed to get ID token from authorization headers');
      }

      // Create Firebase credential
      final AuthCredential credential = GoogleAuthProvider.credential(
        idToken: idToken,
      );

      // Sign in with Firebase
      return await _auth.signInWithCredential(credential);
    } on GoogleSignInException catch (e) {
      throw _handleGoogleSignInException(e);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again: $e';
    }
  }

  String _handleGoogleSignInException(GoogleSignInException e) {
    switch (e.code) {
      case GoogleSignInExceptionCode.canceled:
        return 'Sign in was canceled';
      case GoogleSignInExceptionCode.unknownError:
        return 'Unknown error occurred';
      default:
        return 'Google Sign-In error: ${e.description}';
    }
  }

  // Sign out method
  Future<void> signOut() async {
    await GoogleSignIn.instance.disconnect();
    await _auth.signOut();
    _currentGoogleUser = null;
  }

  // Clear authorization tokens (replaces clearAuthCache)
  Future<void> clearAuthorizationToken() async {
    if (_currentGoogleUser != null) {
      await _currentGoogleUser!.authorizationClient.clearAuthorizationToken(
        accessToken: _currentGoogleUser!.authentication.idToken!,
      );
    }
  }

  // If you need server auth code, use this method
  Future<String?> getServerAuthCode(List<String> scopes) async {
    if (_currentGoogleUser == null) return null;

    try {
      final GoogleSignInServerAuthorization? serverAuth =
          await _currentGoogleUser!.authorizationClient.authorizeServer(scopes);
      return serverAuth?.serverAuthCode;
    } catch (e) {
      print('Error getting server auth code: $e');
      return null;
    }
  }

  // login with Facebook - Checks if user exists before signing in
  Future<UserCredential?> loginWithFacebook() async {
    try {
      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      // Trigger the sign-in flow
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'], // Request email permission
        loginTracking: LoginTracking.limited,
        nonce: nonce,
      );

      // Check if the user granted permission
      if (result.status == LoginStatus.success) {
        // Fetch user data to get email
        final userData = await FacebookAuth.instance.getUserData();
        final email = userData['email'];

        if (email == null) {
          throw 'Could not retrieve email from Facebook profile. Please ensure email permission is granted.';
        }

        // Check if user exists in Firestore
        bool userExists = await checkIfUserExists(email);
        if (!userExists) {
          // User does not exist, do not proceed with login.
          // Optionally, provide feedback to the user.
          Loaders.warningSnackBar(
            title: 'Account Not Found',
            message:
                'No account found with this Facebook email. Please sign up first.',
          );
          await FacebookAuth.instance.logOut(); // Log out from Facebook
          return null;
        }

        // User exists, create a credential from the access token
        // final AccessToken accessToken = result.accessToken!;
        // final OAuthCredential credential =
        //     FacebookAuthProvider.credential(accessToken.tokenString);

        // Build the appropriate credential for iOS
        OAuthCredential credential;
        final token = result.accessToken!;
  if (!kIsWeb && Platform.isIOS && token.type == AccessTokenType.limited) {
          // Use OAuthCredential manually for Limited Login
          credential = OAuthCredential(
            providerId: 'facebook.com',
            signInMethod: 'oauth',
            idToken: token.tokenString,
            rawNonce: rawNonce,
          );
        } else {
          // Classic token flow (Android / web / non-limited iOS)
          credential = FacebookAuthProvider.credential(token.tokenString);
        }

        // Once signed in, return the UserCredential
        return await _auth.signInWithCredential(credential);
      } else if (result.status == LoginStatus.cancelled) {
        throw 'Facebook login cancelled by user.';
      } else {
        throw 'Facebook login failed: ${result.message}';
      }
      // } on FirebaseAuthException catch (e) {
      //   throw MyFirebaseExceptions(e.code).message;
      // } on FirebaseException catch (e) {
      //   throw MyFirebaseExceptions(e.code).message;
      // } on FormatException catch (_) {
      //   throw MyFormatException();
      // } on PlatformException catch (e) {
      //   throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      dev.log(e.toString());
      throw e.toString(); //'Something went wrong, Please try again';
    }
  }

  // // Sign up with Facebook
  Future<UserCredential?> signUpWithFacebook() async {
    try {
      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      // Trigger the sign-in flow, requesting email permission
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
        loginTracking: LoginTracking.limited,
        nonce: nonce,
      );

      // Check if the user granted permission
      if (result.status == LoginStatus.success) {
        // Create a credential from the access token
        // final AccessToken accessToken = result.accessToken!;
        // final OAuthCredential credential =
        //     FacebookAuthProvider.credential(accessToken.tokenString);

        // Build the appropriate credential for iOS
        OAuthCredential credential;
        final token = result.accessToken!;
  if (!kIsWeb && Platform.isIOS && token.type == AccessTokenType.limited) {
          // Use OAuthCredential manually for Limited Login
          credential = OAuthCredential(
            providerId: 'facebook.com',
            signInMethod: 'oauth',
            idToken: token.tokenString,
            rawNonce: rawNonce,
          );
        } else {
          // Classic token flow (Android / web / non-limited iOS)
          credential = FacebookAuthProvider.credential(token.tokenString);
        }

        // Once signed in, return the UserCredential
        return await _auth.signInWithCredential(credential);
      } else if (result.status == LoginStatus.cancelled) {
        throw 'Facebook sign up cancelled by user.';
      } else {
        throw 'Facebook sign up failed: ${result.message}';
      }
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong during Facebook sign up. Please try again.';
    }
  }

  Future<UserCredential?> signInWithApple() async {
    try {
      /// You have to put your service id here which you can find in previous steps
      /// or in the following link: https://developer.apple.com/account/resources/identifiers/list/serviceId
      String clientID = 'com.beauty-mirror.beautymirror.servicesid';

      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      final appleCredential = await SignInWithApple.getAppleIDCredential(
        /// Scopes are the values that you are requiring from
        /// Apple Server.
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],

        /// We are providing Web Authentication for Android Login,
        /// Android uses web browser based login for Apple.
        webAuthenticationOptions:
      !kIsWeb && Platform.isIOS
                ? null
                : WebAuthenticationOptions(
                  clientId: clientID,
                  redirectUri: Uri.parse('${Uri.base.origin}/'),
                ),
        nonce: nonce,
      );

      final AuthCredential appleAuthCredential = OAuthProvider(
        'apple.com',
      ).credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
        rawNonce: rawNonce,
      );

      return await _auth.signInWithCredential(appleAuthCredential);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<UserCredential?> loginInWithApple() async {
    try {
      /// You have to put your service id here which you can find in previous steps
      /// or in the following link: https://developer.apple.com/account/resources/identifiers/list/serviceId
      String clientID = 'com.beauty-mirror.beautymirror.servicesid';

      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      final appleCredential = await SignInWithApple.getAppleIDCredential(
        /// Scopes are the values that you are requiring from
        /// Apple Server.
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],

        /// We are providing Web Authentication for Android Login,
        /// Android uses web browser based login for Apple.
        webAuthenticationOptions:
      !kIsWeb && Platform.isIOS
                ? null
                : WebAuthenticationOptions(
                  clientId: clientID,
                  redirectUri: Uri.parse('${Uri.base.origin}/'),
                ),
        nonce: nonce,
      );

      final jwtPayload = parseJwt(appleCredential.identityToken!);
      final email = jwtPayload['email'];

      bool userExists = await checkIfUserExists(email);
      if (!userExists) {
        throw 'User does not exist';
      }

      final AuthCredential appleAuthCredential = OAuthProvider(
        'apple.com',
      ).credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
        rawNonce: rawNonce,
      );

      return await _auth.signInWithCredential(appleAuthCredential);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> sendEmailVerification() async {
    try {
      await _auth.currentUser?.sendEmailVerification();
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> logout() async {
    try {
      await FirebaseAuth.instance.signOut();
      // After logout, go to Sign In screen
      Get.offAll(() => const LoginScreen());
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> reAuthWithEmailAndPassword(String email, String password) async {
    try {
      AuthCredential credential = EmailAuthProvider.credential(
        email: email,
        password: password,
      );

      await _auth.currentUser!.reauthenticateWithCredential(credential);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> deleteAccount() async {
    try {
      await UserRepository.instance.removeUserRecord(_auth.currentUser!.uid);
      await _auth.currentUser?.delete();
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  // ============================================
  // ACCOUNT LINKING METHODS
  // ============================================

  /// Link Google Account to current user
  Future<void> linkGoogleAccount() async {
    try {
      // Ensure GoogleSignIn is initialized
      if (!_isGoogleSingInInitialized) {
        await initializeGoogleSignIn();
      }

      final GoogleSignIn signIn = GoogleSignIn.instance;

      // Sign out to force account selection
      await signIn.disconnect();

      // Check if the platform supports authenticate method
      if (signIn.supportsAuthenticate()) {
        _currentGoogleUser = await signIn.authenticate();
      } else {
        throw PlatformException(
          code: 'unsupported_platform',
          message: 'This platform requires platform-specific authentication UI',
        );
      }

      if (_currentGoogleUser == null) {
        throw 'Google sign-in was cancelled';
      }

      // Handle authorization
      final GoogleSignInClientAuthorization? existingAuth =
          await _currentGoogleUser!.authorizationClient.authorizationForScopes(
            [],
          );

      if (existingAuth == null) {
        await _currentGoogleUser!.authorizationClient.authorizeScopes([]);
      }

      // Get authorization headers
      final Map<String, String>? headers = await _currentGoogleUser!
          .authorizationClient
          .authorizationHeaders([]);

      if (headers == null) {
        throw Exception('Failed to get authorization headers');
      }

      final String? idToken = headers['Authorization']?.replaceFirst(
        'Bearer ',
        '',
      );

      if (idToken == null) {
        throw Exception('Failed to get ID token from authorization headers');
      }

      // Create Firebase credential
      final AuthCredential credential = GoogleAuthProvider.credential(
        idToken: idToken,
      );

      // Link the credential to current user
      User? user = _auth.currentUser;
      if (user != null) {
        await user.linkWithCredential(credential);
      } else {
        throw 'No user is currently signed in';
      }
    } on GoogleSignInException catch (e) {
      throw _handleGoogleSignInException(e);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong linking Google account: $e';
    }
  }

  /// Link Apple Account to current user
  Future<void> linkAppleAccount() async {
    try {
      String clientID = 'com.beauty-mirror.beautymirror.servicesid';

      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        webAuthenticationOptions:
      !kIsWeb && Platform.isIOS
                ? null
                : WebAuthenticationOptions(
                  clientId: clientID,
                  redirectUri: Uri.parse('${Uri.base.origin}/'),
                ),
        nonce: nonce,
      );

      final AuthCredential appleAuthCredential = OAuthProvider(
        'apple.com',
      ).credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
        rawNonce: rawNonce,
      );

      // Link the credential to current user
      User? user = _auth.currentUser;
      if (user != null) {
        await user.linkWithCredential(appleAuthCredential);
      } else {
        throw 'No user is currently signed in';
      }
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong linking Apple account: $e';
    }
  }

  /// Link Facebook Account to current user
  Future<void> linkFacebookAccount() async {
    try {
      final rawNonce = generateNonce();
      final nonce = sha256ofString(rawNonce);

      // Trigger the sign-in flow
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
        loginTracking: LoginTracking.limited,
        nonce: nonce,
      );

      if (result.status == LoginStatus.success) {
        // Build the appropriate credential for iOS
        OAuthCredential credential;
        final token = result.accessToken!;

  if (!kIsWeb && Platform.isIOS && token.type == AccessTokenType.limited) {
          // Use OAuthCredential manually for Limited Login
          credential = OAuthCredential(
            providerId: 'facebook.com',
            signInMethod: 'oauth',
            idToken: token.tokenString,
            rawNonce: rawNonce,
          );
        } else {
          // Classic token flow (Android / web / non-limited iOS)
          credential = FacebookAuthProvider.credential(token.tokenString);
        }

        // Link the credential to current user
        User? user = _auth.currentUser;
        if (user != null) {
          await user.linkWithCredential(credential);
        } else {
          throw 'No user is currently signed in';
        }
      } else if (result.status == LoginStatus.cancelled) {
        throw 'Facebook login cancelled by user.';
      } else {
        throw 'Facebook login failed: ${result.message}';
      }
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      dev.log(e.toString());
      throw 'Something went wrong linking Facebook account: $e';
    }
  }

  /// Unlink an account provider
  Future<void> unlinkAccount(String providerId) async {
    try {
      User? user = _auth.currentUser;

      if (user == null) {
        throw 'No user is currently signed in';
      }

      // Prevent unlinking if it's the last provider
      if (user.providerData.length <= 1) {
        throw 'Cannot unlink the last authentication method. Please link another account first.';
      }

      await user.unlink(providerId);
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong unlinking account: $e';
    }
  }

  /// Get list of linked provider IDs
  List<String> getLinkedProviders() {
    User? user = _auth.currentUser;
    if (user != null) {
      return user.providerData.map((info) => info.providerId).toList();
    }
    return [];
  }

  /// Check if a specific provider is linked
  bool isProviderLinked(String providerId) {
    return getLinkedProviders().contains(providerId);
  }
}
