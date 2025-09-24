### **General Design System**

Before moving on to the screens, it's worth noting the common design elements used throughout the application to create a cohesive style.

**Background**: The primary background for most screens is light gray (AppColors.light, \#F0F4FF) or white. The onboarding screens use a custom background with a blurred purple ellipse at the top (SoftEllipsePainter).

**Primary Colors**:

* **Primary**: Deep purple (AppColors.primary, \#8A60FF). Used for buttons, active elements, icons, and accents.  
* **Text Primary**: Dark purple (AppColors.textPrimary, \#4B3963). Used for titles and important text.  
* **Text Secondary**: Gray (AppColors.textSecondary). Used for subtitles and less important text.  
* **Buttons and Containers**: White (Colors.white) or light gray (AppColors.lightContainer) is often used for cards and input fields, creating contrast with the main background.

**Fonts**: Although the font family is not specified, standard weights are used:

* **W700 (Bold)**: For titles (sizes 24px, 22px).  
* **W600 (Semibold)**: For subtitles and important text (16px).  
* **W500 (Medium)**: For regular text and selection options (16px, 18px).

**Buttons (ElevatedButton)**:

* **Color**: Primary purple (AppColors.primary).  
* **Text**: White, bold (fontWeight: FontWeight.w600), size 16px or 18px.  
* **Shape**: A rectangle with heavily rounded corners (borderRadius: BorderRadius.circular(16)).  
* **Size**: Height 50-56px, full container width.  
* **Inactive State**: Opacity 0.6.

**Input Fields (TextFormField)**:

* **Background**: White.  
* **Borders**: Light gray stroke (\#ADB2D7), which turns purple (\#8A60FF) on focus. Corner radius of 12px.  
* **Hint Text**: Gray, fontWeight: FontWeight.w400, fontSize: 15px.  
* **Icons**: SVG icons are often used to the left of the input field (e.g., an email or lock icon).

**Cards and Containers**: A custom RoundedContainer widget is used with a white background, rounded corners (16px), and a light shadow to create a sense of depth.

---

### **Welcome and Onboarding Screens (Part 1\)**

#### **Screen 1: Welcome Screen**

This screen is a carousel of four slides.

* **Background**: White.  
* **Elements**:  
  * **Images**: Each slide has a large image that occupies about 55% of the screen height. The images are: welcomeImage1.png, welcomeImage2.png, welcomeImage3.png, welcomeImage4.png.  
  * **Titles**: A title is located below the image. Font size 22px, fontWeight: w700, color AppColors.textPrimary.  
  * **Descriptions**: On the 3rd and 4th slides, there is additional descriptive text. Font size 16px, fontWeight: w600, color AppColors.black.  
  * **Page Indicator**: Consists of 4 dots. The active dot is elongated (32px wide) and purple, while inactive dots are round (8x8px) and gray.  
  * **"Next" Button**: A standard purple button.  
  * **"Sign in" Link**: On the first slide, below the button, there is the text "Already have an account?" and a clickable "Sign in" link in purple.

#### **Screen 2: Onboarding Survey Screen**

This is the main survey screen, consisting of 28 steps. The design changes depending on the step.

* **General Design**:  
  * **Background**: Light gray (\#F0F4FF) with a purple blurred ellipse at the top.  
  * **Top Bar (OnboardingAppbar)**: Includes a "back" button and a progress indicator with 6 steps (General, Lifestyle, Skin, Hair, Physic, AI). Active steps are highlighted in purple, inactive ones in gray. Between the steps are 4 dots that fill up as the user progresses through the pages within a section.  
  * **Assistant Image**: At the top of the screen, there is an image of the assistant (Ellie or Max), which changes with each step.  
  * **Bottom Card**: The main content is located on a white card with rounded corners and a shadow, which animates in from the bottom. The card's height changes depending on the content of the step.  
* Step Content Breakdown:  
  Below is a detailed breakdown of each of the 28 survey steps.  
  * **Step 0: Welcome Step**  
    * **Title**: "Hi\! I’m Ellie, your personal AI assistant." (The name "Ellie" or "Max" is substituted based on the assistant choice).  
    * **Subtitle**: "I'm here to help you find your true beauty through the perfect balance of self-care, mental well-being, and physical health. \\n\\nThe information and recommendations provided by the Beauty Mirror app are for informational and educational purposes only. This app is not intended to be a substitute for professional medical advice, diagnosis, or treatment."  
    * **Input Method**: None. This is an informational screen.  
    * **Buttons**: One button with the text "Let's Go".  
  * **Step 1: Gender Step**  
    * **Title**: "Select Your Gender".  
    * **Subtitle**: "Let us know a bit about you\!".  
    * **Main Content and Input Method**: The user is asked to choose one of two options. Input is made by tapping on one of two circular images. The selected option is highlighted with a thick purple border.  
    * **Option 1**: Image genderMale.png with the caption "Male".  
    * **Option 2**: Image genderFemale.png with the caption "Female".  
    * **Buttons**: Standard "Next" button.  
  * **Step 2: Goal Step**  
    * **Title**: "What do you want to achieve with Beauty Mirror?".  
    * **Subtitle**: "Your aspirations guide our efforts to support and empower you on your journey. Select all that apply."  
    * **Main Content and Input Method**: Multiple selection. The user can select one or more goals by tapping on horizontal cards. A selected card is outlined with a purple border. Each card contains an icon and a text description of the goal.  
    * **Buttons**: A standard "Next" button, which becomes active after at least one goal is selected.  
  * **Step 3: Congratulations Step**  
    * **Title**: "Congratulations on taking the first step\!".  
    * **Subtitle**: "You’ve just made a big move towards becoming the best version of yourself. Let’s keep going — I’m here to guide you every step of the way\!".  
    * **Input Method**: None.  
    * **Buttons**: Standard "Next" button.  
  * **Step 4: Excited Step**  
    * **Title**: "We’re excited to create something just for you\!".  
    * **Subtitle**: "Your personalized plan is in the making, designed to help you shine and feel your best every day. Let's dive deeper into understanding you better to ensure the perfect fit.".  
    * **Input Method**: None.  
    * **Buttons**: Standard "Next" button.  
  * **Step 5: Statistic Step**  
    * **Title**: "87% of our users see results within the first week\!".  
    * **Subtitle**: "You’re on the right path — and your transformation could start even faster than you think. Let’s continue building your personalized plan to achieve amazing results\!".  
    * **Input Method**: None.  
    * **Buttons**: Standard "Next" button.  
  * **Step 6: Privacy Step**  
    * **Title**: "We care about your privacy".  
    * **Subtitle**: "All the data you provide is anonymous and used only for statistical purposes. Your responses help us tailor the app to better suit your needs.".  
    * **Main Content and Input Method**: Informational screen. The main interaction is tapping the "Read Privacy Policy" text link, which opens a modal window with the privacy policy text.  
    * **Buttons**: Standard "Next" button.  
  * **Step 7: General Step**  
    * **Title**: "Tell us about you for personalized recommendations".  
    * **Input Method**: Filling out a form consisting of several fields:  
      * **"Name" Field**: Standard text field (TextFormField) with the hint "Type the name".  
      * **"Age" Field**: Text field with a numeric keyboard (TextInputType.number) and the hint "Type the age".  
      * **"Height" Field**: Combined input. Consists of one or two text fields for numbers and a CustomDropdown for selecting units.  
        * If 'ft\&in' is selected, two fields with hints "feet" and "inches" are displayed.  
        * If 'cm' is selected, one field with the hint "Type your height" is displayed.  
      * **"Weight" Field**: Combined input. Consists of a text field and a dropdown with 'lbs' and 'kg' options.  
      * **"Ethnic group" Field**: A CustomDropdown with the following options: 'European American', 'Asian American', 'European', 'Asian', 'Hispanic / Latino', 'Middle Eastern / North African', 'Native American / Indigenous', 'Pacific Islander', 'Mixed / Other', 'Prefer not to say'.  
    * **Buttons**: One "Next" button that becomes active after all form fields are validated.  
  * **Step 8: Lifestyle Step**  
    * **Title**: "Hi \[User Name\], What’s The Rhythm Of Your Life?".  
    * **Input Method**: Single selection (radio buttons). The user taps on one of the options, which becomes highlighted. Uses the OnboardingOption widget.  
    * **Options**: "Sedentary lifestyle", "Active Lifestyle", "Sports Lifestyle".  
    * **Buttons**: Standard "Next" button, active after a selection is made.  
  * **Step 9: Sleep Step**  
    * **Title**: "How Long Do You Usually Sleep At Night?".  
    * **Subtitle**: "Understanding your sleep patterns helps us tailor your Activity tracking experience.".  
    * **Input Method**: Single selection (radio buttons).  
    * **Options**: "Less than 6 hours", "6-7 hours", "7-8 hours", "8-9 hours", "More than 9 hours".  
    * **Buttons**: Standard "Next" button.  
  * **Steps 10 & 11: Wake Up & End Day**  
    * **Title (Step 10\)**: "What Time Do You Usually Wake Up?".  
    * **Title (Step 11\)**: "What Time Do You Usually End Your Day?".  
    * **Input Method**: Uses a custom TimePicker widget. This consists of two vertical wheel pickers (ListWheelScrollView): the left for hours (00-23) and the right for minutes (00-59). The user swipes up/down on each wheel to select the time.  
    * **Buttons**: Standard "Next" button.  
  * Steps 12-18 (Single & Multiple Choice)  
    These steps have a similar structure with single or multiple choice options.  
    * **Step 12: Stress**: Title "How Often Do You Get Stressed?". Options: "Rarely", "Sometimes", "Often", "Always".  
    * **Step 13: Work Environment**: Title "What's Your Work Environment?". Options: "In Office", "Remote", "Part-Time", "Jobless".  
    * **Step 14: Skin Type**: Title "What Is Your Skin Type?". Options: "Dry Skin", "Normal Skin", "Oily Skin", "Combination Skin", "Let AI analyze". There is a "Skip" button.  
    * **Step 15: Skin Problems**: Title "Skin Problems". Multiple selection of skin problems presented as chips. There is a "Skip" button.  
    * **Step 16: Hair Type**: Title "What Is Your Hair Type?". Options from "Straight" to "Super Kinky" and "Let AI analyze". There is a "Skip" button.  
    * **Step 17: Hair Problems**: Title "Hair Problems". Multiple selection of hair problems presented as chips. There is a "Skip" button.  
    * **Step 18: Physical Activities**: Title "Do You Already Practice Any Physical Activities?". Multiple selection of activities. There is an "I don't exercise" button, which skips the next step.  
  * **Step 19: Activity Frequency**  
    * **Title**: "How Often Do You Engage In These Activities?".  
    * **Input Method**: A list of activities selected in the previous step is displayed. Next to each is the text "Set Frequency". Tapping on an activity opens the ActivityFrequencyPickerDialog. The dialog contains two wheel pickers (ListWheelScrollView):  
      * **Left**: for selecting a number from 1 to 30\.  
      * **Right**: for selecting the period ("Day", "Week", "Month", "Year").  
    * **Buttons**: The dialog has "Cancel" and "OK" buttons. The main screen has a "Next" button, active after all activities have been configured.  
  * **Steps 20-25 (Multiple & Single Choice)**  
    * **Step 20: Diet**: Title "What's Your Diet?". Multiple selection of diets. There is a "No diet" button.  
    * **Step 21: Mood**: Title "Your Most Common Mood Last Month?". Five cards with emojis and labels ("Great", "Good", etc.). Input is by tapping one of the cards.  
    * **Step 22: Energy Level**: Title "How's Your Daily Energy Level?".  
      * **Input Method**: A custom BatteryWidget. It looks like a battery with 5 segments, with colors changing from red to green. The user slides their finger (vertical drag) up or down inside the widget to "charge" or "discharge" the battery, selecting a level from 1 to 5\.  
    * **Step 23: Procrastination**: Title "Do You Often Procrastinate?". Single choice: "Always", "Sometimes", "Rarely", "Never".  
    * **Step 24: Focus**: Title "Do You Often Find It Hard To Focus?". Single choice: "Always", "Sometimes", "Rarely", "Never".  
    * **Step 25: Organization Influence**: Title "What Influenced You To Become Organized?". Multiple selection in the form of chips.  
  * Steps 26-27: AI Analysis  
    These steps take up the full screen, without the separation of a top image and bottom card.  
    * **Step 26: Analysis Intro**:  
      * **Title**: "Let me analyze your face, hair, and body".  
      * **Content**: A large image of the assistant (onboardingImage27Ellie.png or onboardingImage27Max.png).  
    * **Step 27: Photo Upload**:  
      * **Title**: "Upload Clear Photos Of Your Face, Hair, And Full Body".  
      * **Input Method**: Three sections for photo uploads: "Face", "Hair", "Body". Each section consists of an example image on the left and an upload area on the right. The upload area is a square with a dashed purple-blue gradient border (DottedBorder). Tapping it opens the CameraScreen. After a successful photo is taken, a large green checkmark appears in the area.  
      * **Buttons**: The "Next" button becomes active after all three photos are uploaded.  
  * Step 28: AI Results  
    This is not a survey step, but the results screen that appears after step 27\. It was previously described in detail as "Screen 10: AI Analysis".

---

### **Registration and Login Screens**

#### **Screen 3: Sign Up**

* **Background**: Light gray (AppColors.light).  
* **Elements**:  
  * **Logo**: lightAppLogo.png at the top.  
  * **Form**: Located on a white card. Contains fields for Email, Password, and Confirm Password.  
  * **Password Requirements**: As the user types a password, chips with requirements ("8 characters", "1 symbol", etc.) appear below the field. Fulfilled requirements turn green.  
  * **"Sign Up" Button**: Standard purple.  
  * **Divider**: A line with the text "or" in the middle.  
  * **Social Networks**: Buttons for signing in with Google, Facebook, Apple.  
  * **Policy**: Text "By proceeding, you agree..." with clickable "Terms of Use" and "Privacy Policy" links.  
  * **Login Link**: At the bottom of the screen: "Already have an account? Sign in".

#### **Screen 4: Login**

* **Design**: Very similar to the registration screen.  
* **Elements**:  
  * **Form**: Fields for Email and Password.  
  * **"Forgot Password" Link**: Below the input fields.  
  * **"Sign In" Button**: Standard purple.  
  * **Social Networks and Policy**: Same as the registration screen.

#### **Screen 5: Verify Email**

* **Elements**:  
  * **Image**: A large deliveredEmailIllustration.png illustration.  
  * **Text**: Title "Verify your email address\!", your email, and explanatory text.  
  * **Buttons**: A purple "Continue" button and a "Resend Email" text button.

#### **Screen 6: Forgot Password & Reset Password**

* **Forgot Password**: A screen with a field for email input and a "Submit" button.  
* **Reset Password**: The screen that appears after the email is sent. Contains the deliveredEmailIllustration.png, the text "Password Reset Email Sent", a "Done" button, and a "Resend Email" text button.

---

### **Activity Creation Screens**

#### **Screen 7: Choose Activities**

* **Background**: White.  
* **Elements**:  
  * **Search (ExpandableSearchWidget)**: A search field that expands on tap, revealing a "Create Custom Procedure" button.  
  * **Activity List**: Activities are grouped by categories (e.g., "Skincare", "Fitness"). The category name serves as a header.  
  * **Activity Item (ActivityItem)**: A horizontal card with a colored icon on the left, the activity name, and a checkmark on the right if it's selected.  
  * **"Next" Button**: Standard purple, becomes active when at least one activity is selected.

#### **Screen 8: Create/Edit Schedule Screen**

* **Background**: Light gray (AppColors.light).  
* **Elements**:  
  * **Activity Schedule Card (ActivityScheduleCard)**: For each selected activity, a separate card is created where its parameters can be configured.  
  * **"Note" Field**: A multi-line text field for notes.  
  * **Frequency Selection**: A SegmentedControl with options "Daily", "Weekly", "Monthly".  
  * **Day Configuration**: Different widgets appear depending on the frequency:  
    * **Daily**: Day of the week selection (S, M, T, W, T, F, S).  
    * **Weekly**: A horizontal list to select the week (1, 2, 3...).  
    * **Monthly**: A field that, when tapped, opens a CalendarGrid to select specific days of the month.  
  * **Time Selection**: A field that opens the TimePicker. Below it are chips for "Morning", "Afternoon", "Evening" for quick time setting.  
  * **Switches**: "End Before" and "Remind Me" (CustomSwitch). When activated, additional options appear for setting an end date and reminder time.  
  * **"Save" Button**: Standard purple.

---

### **Onboarding Screens (Part 2\)**

#### **Screen 9: Onboarding (Part 2\)**

This screen also consists of several steps.

* **Step 1: Progress Screen**:  
  * **Image**: The assistant looking at a screen.  
  * **Title**: "Creating Your Perfect Schedule...".  
  * **Step List**: An animated list of 4 items ("Analyzing your answers", ..., "Done\!"). To the left of each item is a loading icon that changes to a green checkmark upon completion.  
* **Step 2: Reminders Screen**:  
  * **Title**: "Stay on track with personalized reminders\!".  
  * **Switches**: Two CustomSwitch toggles to enable daily reminders and activity reminders.  
* **Step 3: Contract Screen**:  
  * **Title**: "Let's Make A Contract".  
  * **Commitment List**: Items starting with a star icon (contractStar.svg).  
  * **Signature Field**: A rectangular area with a gray border where the user can sign with their finger (Signature widget).  
  * **"Finish" Button**: Standard purple.

---

### **Results and Subscription Screens**

#### **Screen 10: AI Analysis (AI Results / Condition Analysis Screen)**

* **Background**: Light gray.  
* **Elements**: The screen consists of several informational cards.  
  * **BMI Widget**: A card with your BMI. On the left is a custom vertical scale indicator (\_BmiGauge) and the numerical BMI value. On the right is a body illustration (bmiMale1.png, etc.) corresponding to the BMI value.  
  * **Condition Card**: Cards for "Skin Condition", "Hair Condition", etc. Inside is the title, a brief explanation, and an AnimatedScoreCircle with a score from 1 to 10\.  
  * **BMS Card**: The final "Beauty Mirror Score". Includes a horizontal scale indicator (BmsGaugeHorizontal).  
  * **"To The Activities" Button**: Leads to the next screen.  
  * **Info Icons**: Next to the card titles, there are info icons (i) that, when tapped, open a bottom sheet with detailed information and a source link.

#### **Screen 11: Results and Benefits (Result Screen)**

* **Design**: All information is placed on a single large white card.  
* **Elements**:  
  * **Title**: "Regular Care \= Better Results\!".  
  * **Graph**: A stylized graph (graph.png) showing progress with/without the app.  
  * **Before/After Comparison**: An illustration with an arrow (improvementArrow.png) showing figure improvement.  
  * **Timeline (ImprovementTimeline)**: A vertical timeline with 4 steps showing the improvement journey.  
  * **"With" / "Without" Cards**: Two cards, "Positives" (with checkmarks) and "Negatives" (with minuses), listing the pros and cons of using/not using the app.  
  * **Review Carousel (ReviewCarousel)**: A horizontal carousel with user reviews.  
  * **"Price Plans" Button**: Leads to the subscription screen.

#### **Screen 12: Subscription Screen**

* **Design**: Information is placed on a white card against a light gray background.  
* **Elements**:  
  * **Title**: "Choose your plan".  
  * **Price Plan Cards (PricePlanCard)**: Several cards with subscription options (e.g., "Monthly", "6 Months"). The most popular one has a yellow "Most Popular" tag. The selected plan is outlined with a yellow border.  
  * **Features List (FeaturesCard)**: A list of chips with an icon and text describing the benefits of the premium subscription.  
  * **Reviews Block**: Two blocks with a "4.9/5" rating and "10k+" users.  
  * **"Try for Free" Button**: A bright green button.  
  * **Links**: "Terms of Use", "Privacy Policy", "Restore Purchase".

#### **Screen 13: Congratulations Screen**

* **Design**: All information on a single large white card.  
* **Elements**:  
  * **Animation**: At the top, a flying confetti animation (congratulationsAnimation.json).  
  * **Icon**: In the center of the animation, a large purple crown icon.  
  * **Text**: Title "Congratulations\!" and a welcome to the premium club.  
  * **Benefits List**: An animated list of unlocked benefits that appear one by one.  
  * **"Start Exploring" Button**: Standard purple.