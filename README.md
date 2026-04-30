# FitPlate Nutrition Recognition

Low-cost food nutrition recognition web app.

## Architecture

1. Frontend uploads a food image or accepts manual food input.
2. Image recognition runs in the browser with a free Food-101 image classifier via Transformers.js.
3. Recognition returns only top 5 food candidates:
   - label
   - confidence
4. User confirms or edits food name and grams in the browser.
5. Backend queries USDA FoodData Central first.
6. If USDA has no result, backend queries Open Food Facts.
7. Backend calculates calories, protein, fat, and carbohydrate for the confirmed grams.

## Setup

```bash
npm install
copy .env.example .env
npm start
```

Then open:

```text
http://localhost:3000
```

## Environment

`.env` should contain:

```text
USDA_API_KEY=your-usda-fooddata-central-api-key
PORT=3000
```

`USDA_API_KEY` is recommended. If it is missing, the app falls back directly to Open Food Facts for nutrition lookup.

## Notes

- No OpenAI API key is required for image recognition.
- Browser image recognition is free and only for candidate suggestions.
- Nutrition is not finalized until the user confirms or edits the food name and grams.
- Any recognition candidate with confidence below `0.7` defaults to manual confirmation mode.
