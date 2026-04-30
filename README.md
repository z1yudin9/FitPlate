# FitPlate Nutrition Recognition

Low-cost food nutrition recognition web app.

## Architecture

1. Frontend uploads a food image or accepts manual food input.
2. Express backend keeps API keys out of the browser.
3. Backend calls an OpenAI vision model and returns only food candidates:
   - food name
   - confidence
   - estimated grams
   - whether user confirmation is required
4. User edits food name and grams in the browser.
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
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_VISION_MODEL=gpt-4.1-mini
USDA_API_KEY=your-usda-fooddata-central-api-key
PORT=3000
```

`USDA_API_KEY` is recommended. If it is missing, the app falls back directly to Open Food Facts for nutrition lookup.

## Notes

- The OpenAI key is used only by the backend.
- Image recognition uses `detail: low` for lower cost.
- Nutrition is not finalized until the user confirms or edits the food name and grams.
- Any recognition candidate with confidence below `0.7` is marked as requiring user confirmation.
