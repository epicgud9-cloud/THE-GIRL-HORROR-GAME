# THE GIRL — beginner website horror game

This is a starter project made with plain **HTML, CSS and JavaScript**. It has no paid services, no account system and no external libraries.

## What's included

- 50 written questions, divided into three gradual-horror stages.
- Every playthrough randomly chooses a length from **20 to 50 questions**.
- Questions are randomized within each stage. Repeats are allowed.
- A repeated question with a changed answer makes the girl say: **“Why did you change your mind?”** and changes her expression to `:I`.
- The girl's illustrated face becomes clearer as the questions progress.
- Chrome speech recognition lets the player answer with a microphone. A text box is included as a fallback.
- Browser speech synthesis reads the girl's questions and replies aloud.
- `localStorage` remembers progress and answers if the player closes the page before finishing.
- After the final answer, the page turns black. If the optional camera ending is enabled and permission is available, it says **“LOOK BEHIND YOU”** and checks for two noticeable movements in the camera image. Otherwise, it jumps directly to the scare.
- If the player leaves after the questions have finished but before the scare, returning shows the two special lines and then the scare.

## Important limitations of this first version

1. The contradiction detector compares answers to the **same repeated question**. It is not an AI lie detector and cannot reliably understand every contradiction between differently worded answers.
2. Speech recognition support varies. In Chrome, speech recognition may use an online recognition service, so it may need an internet connection. The website saves the recognized text locally; it does not save microphone recordings.
3. The optional camera ending uses simple local image-change detection, not facial recognition or eye tracking. Turning away and back may trigger it, but lighting changes or other movement can also trigger it. No camera frames are uploaded or saved.
4. The camera is never requested unless the player checks the optional camera box and clicks **Check camera permission**. It is used only during the final scene. The player can leave it off.
5. The built-in face is a CSS illustration, not a custom character image. You can replace it later with your own art.

## Part 1 — open the project in VS Code

1. Download and extract `TheGirl_Horror_Website_Starter.zip`.
2. Open Visual Studio Code.
3. Choose **File → Open Folder**.
4. Select the extracted `TheGirl` folder.
5. In the left sidebar, you should see `index.html`, `style.css`, `game.js` and this `README.md`.

## Part 2 — run it in Chrome

The easiest beginner method is the **Live Server** extension in VS Code:

1. In VS Code, click the Extensions icon on the left.
2. Search for **Live Server** and install the extension by Ritwick Dey.
3. Open `index.html` in the editor.
4. Click **Go Live** in the bottom-right corner of VS Code.
5. Chrome should open a local address, usually something like `http://127.0.0.1:5500`.
6. Click **Start conversation**.
7. When Chrome asks for microphone permission, choose Allow if you are comfortable. You can also type answers instead.

If you do not want to install the Live Server extension, you can use another local web server. Do not expect microphone speech recognition to work reliably by double-clicking the HTML file; use the local server address.

## Part 3 — test the camera ending

1. Return to the welcome screen (or refresh before beginning a new conversation).
2. Check **I'd like to enable the optional camera ending**.
3. Click **Check camera permission**.
4. Chrome will ask for camera access. Allow only if you are comfortable using the camera for this game.
5. The permission-check stream is stopped immediately. The camera is requested again only during the final scene.
6. To disable it, uncheck the box. The game will use the direct jumpscare ending instead.

The camera check is optional. Do not enable it on a device or in a room where you do not feel comfortable using a camera.

## Part 4 — understand the three code files

### `index.html`
Contains the page structure: welcome screen, consent text, question panel, portrait, microphone button, text-answer box and ending screens.

### `style.css`
Controls the appearance: dark background, portrait illustration, buttons, layout, gradual face reveal and jumpscare animation.

### `game.js`
Contains the 50 questions, random question selection, speech recognition, spoken dialogue, answer memory, progress saving, optional camera ending and final sequence.

## Part 5 — customize the questions

Open `game.js` and find `const QUESTION_BANK = [`. Each question has an ID, a phase and the text the girl says:

```js
{ id: "q01", phase: "early", text: "What's your favourite colour?" }
```

- Keep each `id` unique (`q01`, `q02`, etc.).
- Use `phase: "early"` for innocent opening questions.
- Use `phase: "middle"` for unusual questions.
- Use `phase: "late"` for the most unsettling questions.
- Keep the question text inside quotation marks.

The game chooses from the early pool at the start, the middle pool in the middle, and the late pool near the end. It can repeat a question.

## The 50-question bank included in this version

The game uses these prompts in three stages. It chooses randomly within the current stage, and it is allowed to repeat a prompt. The exact wording can be edited in `game.js`.

### Stage 1 — friendly (questions 1–15)

1. What's your favourite colour?
2. What's your favourite snack?
3. Do you prefer sunny days or rainy days?
4. What's an animal you really like?
5. What kind of music do you enjoy?
6. Do you like drawing or painting?
7. What's your favourite season?
8. Are you more awake in the morning or at night?
9. What's a game you enjoy playing?
10. Do you enjoy listening to stories?
11. What do you like doing when it rains?
12. Do you like quiet places?
13. What's a sound that makes you feel calm?
14. Would you rather visit a forest or a beach?
15. Do you prefer reading or watching films?

### Stage 2 — unusual (questions 16–35)

16. Do you remember most of your dreams?
17. Do you ever talk to yourself when you're thinking?
18. Do you like being in a room by yourself?
19. Have you ever thought you heard someone call your name?
20. Do you notice when someone suddenly goes quiet?
21. Would you tell me if I asked you the same question twice?
22. Do you think people change their minds often?
23. Have you ever pretended to like something?
24. Do you think I've asked you too many questions?
25. Did you hear anything just now?
26. Are you looking at my face?
27. Do you think my face looks different from before?
28. If I stopped talking, would you wait?
29. Do you think I remember every answer?
30. Would you notice if I stopped smiling?
31. Do you think I can tell when someone is lying?
32. Have I asked you this before?
33. Why did you take so long to answer?
34. Did you look away from the screen?
35. Are you still listening to me?

### Stage 3 — unsettling (questions 36–50)

36. Do you think I'm alone in here?
37. Is the room behind you dark?
38. Did you check whether I was still here?
39. Why did you come back to the website?
40. Would you recognize me in a different picture?
41. Do you think I can see you?
42. Why are you looking at the screen instead of me?
43. Have you noticed my face changing?
44. Do you remember what I looked like at the beginning?
45. Do you think I look happier now?
46. Are you going to leave before we finish?
47. Would you close this page if I asked you to?
48. Can you promise not to forget me?
49. Do you think we're nearly finished?
50. Can you look at me one last time?

## Part 6 — change the number of questions

Find this line in `game.js`:

```js
total: randomInteger(20, 50),
```

For example, `randomInteger(25, 40)` would make each playthrough 25–40 questions long.

## Part 7 — change the girl's voice

Find the `speak` function in `game.js`. These settings affect the browser's voice:

```js
utterance.lang = "en-US";
utterance.rate = 0.88;
utterance.pitch = 0.82;
utterance.volume = 0.82;
```

Different computers may have different installed voices. The actual voice is chosen by the browser and operating system.

## Part 8 — reset a saved run

The welcome screen shows **Forget this conversation and start over** when a run is saved. Click it and confirm. That clears the saved questions and answers for this website in this browser.

You can also use Chrome's site data controls to clear this local website's storage. Be aware that this also clears its saved progress.

## Part 9 — publish later (optional)

You can test the whole project on your own computer before publishing anything.

When you are ready, GitHub Pages can publish static HTML, CSS and JavaScript files. A typical setup is:

1. Create a GitHub repository for the project.
2. Upload the contents of this folder so `index.html` is at the top level of the repository.
3. Open the repository's **Settings → Pages**.
4. Choose the `main` branch and the root (`/`) folder as the publishing source, then save.
5. Use the site address GitHub Pages provides.

**Public-site warning:** a GitHub Pages site is publicly available. Do not put private information, passwords, personal photos or private answers in the repository. This prototype stores answers in each visitor's own browser; it does not send them to your GitHub repository.

## Troubleshooting

- **The microphone button says speech recognition is unavailable:** type the answer instead, or try a current Chrome desktop version.
- **Chrome does not ask for microphone permission:** click the site-controls icon beside the address and check microphone permission for the local site.
- **Speech recognition shows a network error:** connect to the internet and try again, or use the text field.
- **The camera button does not work:** make sure the checkbox is checked, use the Live Server address, and check Chrome's camera permission for that site.
- **The page looks unstyled:** make sure `style.css` is in the same folder as `index.html` and the filename is spelled exactly.
- **The buttons do nothing:** make sure `game.js` is in the same folder and check the Chrome DevTools Console (`F12`) for an error message.

## Privacy checklist before sharing with anyone

- Keep the camera option unchecked by default.
- Keep the microphone/camera explanations on the welcome screen.
- Do not add hidden recording or upload code.
- Test with typed answers first.
- Tell anyone testing that Chrome speech recognition may process audio through an online service.
- Let testers decline microphone and camera access without blocking the typed-answer version.
