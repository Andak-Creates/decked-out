export const Decks = [
  // Mild Mischief - Light, playful, fun
  {
    name: "Mild Mischief",
    slug: "mild-mischief",
    description: "For The Truly Unhinged",

    // decks
    decks: [
      // Truth or Dare
      {
        name: "Truth or Dare",
        description: "Say it or do it, no excuses",
        genderCheck: true,
        slug: "truth-or-dare",
        type: "multiplayer-player",

        // cards
        cards: [
          // Truth cards - Mild
          {
            type: "truth",
            text: "What's the most embarrassing thing that's ever happened to you?",
            timer: null,
            gender: null, // Gender-neutral
          },
          {
            type: "truth",
            text: "Who was your first crush?",
            timer: null,
            gender: null, // Gender-neutral
          },
          {
            type: "truth",
            text: "What's the worst lie you've ever told?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your biggest pet peeve?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you're secretly good at?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most childish thing you still do?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your most embarrassing childhood memory?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the weirdest food combination you enjoy?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you've never told your parents?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your guilty pleasure TV show?",
            timer: null,
          },
          // Dare cards - Mild
          {
            type: "dare",
            text: "Do your best impression of someone in the room",
            timer: null,
            gender: null, // Gender-neutral
          },
          {
            type: "dare",
            text: "Let someone go through your phone for 1 minute",
            timer: null,
            gender: null, // Gender-neutral
          },
          {
            type: "dare",
            text: "Sing a song chosen by the group",
            timer: null,
          },
          {
            type: "dare",
            text: "Do 20 push-ups",
            timer: null,
          },
          {
            type: "dare",
            text: "Call your mom and tell her you love her",
            timer: null,
          },
          {
            type: "dare",
            text: "Let the group post a status on your social media",
            timer: null,
          },
          {
            type: "dare",
            text: "Eat a spoonful of a condiment",
            timer: null,
          },
          {
            type: "dare",
            text: "Do your best dance move",
            timer: null,
          },
          {
            type: "dare",
            text: "Let someone draw on your face with a washable marker",
            timer: null,
          },
          {
            type: "dare",
            text: "Text your ex and say 'hey'",
            timer: null,
          },
          // Example card with player assignments and gender filter
          {
            type: "dare",
            text: "{PlayerA} should kiss {PlayerB}'s neck",
            timer: null,
            requiresOppositeGender: true, // When gender filter is ON, Player A and B will be opposite genders
          },
          {
            type: "dare",
            text: "{PlayerA} must give {PlayerB} a 30 second massage",
            timer: 30,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must let {PlayerB} go through their phone for 1 minute",
            timer: 60,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to whisper something sexy in {PlayerB}'s ear",
            timer: null,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must dance seductively for {PlayerB}",
            timer: 30,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to let {PlayerB} post one thing on their social media",
            timer: null,
            requiresOppositeGender: true,
          },
        ],
      },

      // Never Have I Ever
      {
        name: "Never Have I Ever",
        description: "Time to expose your wild side",
        genderCheck: false,
        slug: "never-have-i-ever",
        type: "single-player",

        // cards
        cards: [
          {
            type: "Challenge",
            text: "Never have I ever gone skinny dipping",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever kissed someone I just met",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had a one-night stand",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever sent a nude photo",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever hooked up with someone at a party",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a public place",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had a threesome",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever cheated on someone",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met online",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a car",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with a friend's ex",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone much older than me",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone much younger than me",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex while someone else was in the room",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in the shower",
            timer: null,
          },
        ],
      },
    ],
  },

  // Risky Business - Medium intensity, more daring
  {
    name: "Risky Business",
    slug: "risky-business",
    description: "For The Truly Unhinged",

    // decks
    decks: [
      // Truth or Dare
      {
        name: "Truth or Dare",
        description: "Say it or do it, no excuses",
        genderCheck: true,
        slug: "truth-or-dare",
        type: "multi-player",

        // cards
        cards: [
          // Truth cards - Risky
          {
            type: "truth",
            text: "What's the kinkiest thing you've ever done?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your biggest sexual fantasy?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the wildest place you've ever had sex?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most people you've been with at once?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you've always wanted to try in bed?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the kinkiest text you've ever sent?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your favorite position?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the longest you've gone without sex?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you're ashamed to admit turns you on?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most embarrassing thing that happened during sex?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your body count?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the kinkiest thing you've searched online?",
            timer: null,
          },
          // Dare cards - Risky
          {
            type: "dare",
            text: "Show the last photo in your camera roll",
            timer: null,
          },
          {
            type: "dare",
            text: "Let someone read your last 5 text messages",
            timer: null,
          },
          {
            type: "dare",
            text: "Strip down to your underwear",
            timer: null,
          },
          {
            type: "dare",
            text: "Kiss the person to your left",
            timer: null,
          },
          {
            type: "dare",
            text: "Let the group look through your search history",
            timer: null,
          },
          {
            type: "dare",
            text: "Send a sexy text to the last person you texted",
            timer: null,
          },
          {
            type: "dare",
            text: "Do a sexy dance for the group",
            timer: null,
          },
          {
            type: "dare",
            text: "Let someone go through your photos for 2 minutes",
            timer: null,
          },
          {
            type: "dare",
            text: "Call your crush and put them on speaker",
            timer: null,
          },
          {
            type: "dare",
            text: "Let the group see your browser history",
            timer: null,
          },
          // Player interaction cards - Risky
          {
            type: "dare",
            text: "{PlayerA} must kiss {PlayerB} passionately for 10 seconds",
            timer: 10,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to let {PlayerB} see their entire photo gallery",
            timer: 120,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must give {PlayerB} a lap dance",
            timer: 60,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to send {PlayerB} a sexy text right now",
            timer: null,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must let {PlayerB} control their phone for 2 minutes",
            timer: 120,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to strip down to their underwear for {PlayerB}",
            timer: 30,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must let {PlayerB} read their private messages",
            timer: 60,
            requiresOppositeGender: true,
          },
        ],
      },

      // Never Have I Ever
      {
        name: "Never Have I Ever",
        description: "Time to expose your wild side",
        genderCheck: false,
        slug: "never-have-i-ever",
        type: "single-player",

        // cards
        cards: [
          {
            type: "Challenge",
            text: "Never have I ever had sex with two people in one day",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a bathroom",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I shouldn't have",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a pool or hot tub",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex while high",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met that same day",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a dressing room",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone while their partner was in the next room",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in an elevator",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone from work",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met on a dating app",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a movie theater",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone much older",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in someone else's bed",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex while someone was watching",
            timer: null,
          },
        ],
      },
    ],
  },

  // Sin City - High intensity, most extreme
  {
    name: "Sin City",
    slug: "sin-city",
    description: "For The Truly Unhinged",

    // decks
    decks: [
      // Truth or Dare
      {
        name: "Truth or Dare",
        description: "Say it or do it, no excuses",
        genderCheck: true,
        slug: "truth-or-dare",
        type: "multi-player",

        // cards
        cards: [
          // Truth cards - Sin City (most intense)
          {
            type: "truth",
            text: "What's the most depraved thing you've ever done?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your darkest sexual fantasy?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most taboo thing you've ever wanted to try?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the kinkiest thing you've done with someone else?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you've done that you'd never want your family to know?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most extreme place you've had sex?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's your body count? Be honest.",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the kinkiest video you've ever watched?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something sexual you've done that you're ashamed of?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most people you've been with in one session?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's the most extreme thing you've done for money?",
            timer: null,
          },
          {
            type: "truth",
            text: "What's something you've done that would shock everyone here?",
            timer: null,
          },
          // Dare cards - Sin City (most intense, some with timers)
          {
            type: "dare",
            text: "Strip completely naked for 30 seconds",
            timer: 30,
          },
          {
            type: "dare",
            text: "Let someone go through your entire phone for 3 minutes",
            timer: 180,
          },
          {
            type: "dare",
            text: "Send a nude photo to someone in the group",
            timer: null,
          },
          {
            type: "dare",
            text: "Kiss the person you find most attractive here",
            timer: null,
          },
          {
            type: "dare",
            text: "Let the group see your entire search history",
            timer: null,
          },
          {
            type: "dare",
            text: "Do a strip tease for the group",
            timer: 60,
          },
          {
            type: "dare",
            text: "Call your ex and tell them you miss them",
            timer: null,
          },
          {
            type: "dare",
            text: "Let someone post whatever they want on your social media",
            timer: null,
          },
          {
            type: "dare",
            text: "Show the group your most recent explicit photo",
            timer: null,
          },
          {
            type: "dare",
            text: "Let the group read your private messages for 2 minutes",
            timer: 120,
          },
          {
            type: "dare",
            text: "Do whatever the group tells you to do for 1 minute",
            timer: 60,
          },
          {
            type: "dare",
            text: "Let someone control your phone for 5 minutes",
            timer: 300,
          },
          // Player interaction cards - Sin City (most intense)
          {
            type: "dare",
            text: "{PlayerA} must make out with {PlayerB} for 30 seconds",
            timer: 30,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to let {PlayerB} see their most explicit photos",
            timer: 60,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must give {PlayerB} a full body massage",
            timer: 120,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to send {PlayerB} a nude photo",
            timer: null,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must strip completely naked for {PlayerB}",
            timer: 30,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to let {PlayerB} control their phone for 5 minutes",
            timer: 300,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} must do whatever {PlayerB} tells them to do for 1 minute",
            timer: 60,
            requiresOppositeGender: true,
          },
          {
            type: "dare",
            text: "{PlayerA} has to let {PlayerB} post whatever they want on their social media",
            timer: null,
            requiresOppositeGender: true,
          },
        ],
      },

      // Never Have I Ever
      {
        name: "Never Have I Ever",
        description: "Time to expose your wild side",
        genderCheck: false,
        slug: "never-have-i-ever",
        type: "single-player",

        // cards
        cards: [
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I just met that day",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a public bathroom",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone while their partner was in the house",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a car in a public parking lot",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met on a hookup app",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I shouldn't have",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a risky public place",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with multiple people in one night",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met online the same day",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a place where I could have been caught",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone while someone else was watching",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I met at a bar that night",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in a place I definitely shouldn't have",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex with someone I barely knew",
            timer: null,
          },
          {
            type: "Challenge",
            text: "Never have I ever had sex in the most inappropriate place you can think of",
            timer: null,
          },
        ],
      },
    ],
  },
];
