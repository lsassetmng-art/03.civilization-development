package com.lsam.life.mealplanner;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String PREFS = "mealplanner_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText dateInput;
    private Spinner mealTypeSpinner;
    private EditText caloriesInput;
    private EditText proteinInput;
    private EditText menuInput;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        dateInput = findViewById(R.id.dateInput);
        mealTypeSpinner = findViewById(R.id.mealTypeSpinner);
        caloriesInput = findViewById(R.id.caloriesInput);
        proteinInput = findViewById(R.id.proteinInput);
        menuInput = findViewById(R.id.menuInput);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        ArrayAdapter<String> mealAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"Breakfast", "Lunch", "Dinner", "Snack"}
        );
        mealAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        mealTypeSpinner.setAdapter(mealAdapter);

        dateInput.setText("2026-04-21");

        saveButton.setOnClickListener(v -> saveRecord());
        sampleButton.setOnClickListener(v -> insertSample());
        clearButton.setOnClickListener(v -> clearData());

        render();
    }

    private void saveRecord() {
        try {
            JSONArray arr = readArray();
            JSONObject obj = new JSONObject();
            obj.put("date", textOf(dateInput));
            obj.put("mealType", String.valueOf(mealTypeSpinner.getSelectedItem()));
            obj.put("calories", textOf(caloriesInput));
            obj.put("protein", textOf(proteinInput));
            obj.put("menu", textOf(menuInput));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            caloriesInput.setText("");
            proteinInput.setText("");
            menuInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        dateInput.setText("2026-04-21");
        mealTypeSpinner.setSelection(1);
        caloriesInput.setText("540");
        proteinInput.setText("24");
        menuInput.setText("Chicken salad bowl");
        memoInput.setText("High protein sample");
    }

    private void clearData() {
        prefs.edit().remove(KEY_RECORDS).apply();
        render();
    }

    private JSONArray readArray() {
        try {
            return new JSONArray(prefs.getString(KEY_RECORDS, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private String textOf(EditText editText) {
        return editText.getText() == null ? "" : editText.getText().toString().trim();
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return 0;
        }
    }

    private void render() {
        JSONArray arr = readArray();
        int count = arr.length();
        int totalCalories = 0;
        int totalProtein = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String date = obj.optString("date", "");
            String mealType = obj.optString("mealType", "");
            String calories = obj.optString("calories", "");
            String protein = obj.optString("protein", "");
            String menu = obj.optString("menu", "");
            String memo = obj.optString("memo", "");

            totalCalories += parseInt(calories);
            totalProtein += parseInt(protein);

            sb.append(date)
              .append(" | ")
              .append(mealType)
              .append(" | ")
              .append(calories)
              .append(" kcal | protein ")
              .append(protein)
              .append(" g");
            if (!menu.isEmpty()) {
                sb.append("\n").append(menu);
            }
            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Meals: " + count + "\n" +
                "Total Calories: " + totalCalories + "\n" +
                "Total Protein: " + totalProtein + " g"
        );

        recordsText.setText(sb.length() == 0 ? "No meals yet" : sb.toString());
    }
}
