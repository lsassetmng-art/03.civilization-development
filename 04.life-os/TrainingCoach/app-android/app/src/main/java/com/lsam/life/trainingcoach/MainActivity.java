package com.lsam.life.trainingcoach;

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
    private static final String PREFS = "trainingcoach_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText dateInput;
    private Spinner categorySpinner;
    private EditText minutesInput;
    private Spinner intensitySpinner;
    private EditText workoutInput;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        dateInput = findViewById(R.id.dateInput);
        categorySpinner = findViewById(R.id.categorySpinner);
        minutesInput = findViewById(R.id.minutesInput);
        intensitySpinner = findViewById(R.id.intensitySpinner);
        workoutInput = findViewById(R.id.workoutInput);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        ArrayAdapter<String> categoryAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"Cardio", "Strength", "Mobility", "Recovery"}
        );
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        categorySpinner.setAdapter(categoryAdapter);

        ArrayAdapter<String> intensityAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"Low", "Medium", "High"}
        );
        intensityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        intensitySpinner.setAdapter(intensityAdapter);

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
            obj.put("category", String.valueOf(categorySpinner.getSelectedItem()));
            obj.put("minutes", textOf(minutesInput));
            obj.put("intensity", String.valueOf(intensitySpinner.getSelectedItem()));
            obj.put("workout", textOf(workoutInput));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            minutesInput.setText("");
            workoutInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        dateInput.setText("2026-04-21");
        categorySpinner.setSelection(1);
        minutesInput.setText("45");
        intensitySpinner.setSelection(1);
        workoutInput.setText("Full body circuit");
        memoInput.setText("Sample session");
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
        int totalMinutes = 0;
        int highCount = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String date = obj.optString("date", "");
            String category = obj.optString("category", "");
            String minutes = obj.optString("minutes", "");
            String intensity = obj.optString("intensity", "");
            String workout = obj.optString("workout", "");
            String memo = obj.optString("memo", "");

            totalMinutes += parseInt(minutes);
            if ("High".equals(intensity)) {
                highCount += 1;
            }

            sb.append(date)
              .append(" | ")
              .append(category)
              .append(" | ")
              .append(minutes)
              .append(" min | ")
              .append(intensity);
            if (!workout.isEmpty()) {
                sb.append("\n").append(workout);
            }
            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Sessions: " + count + "\n" +
                "Total Minutes: " + totalMinutes + "\n" +
                "High Intensity: " + highCount
        );

        recordsText.setText(sb.length() == 0 ? "No workouts yet" : sb.toString());
    }
}
