package com.lsam.life.lifeplanner;

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
    private static final String PREFS = "lifeplanner_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText planTitleInput;
    private Spinner categorySpinner;
    private Spinner horizonSpinner;
    private EditText targetYearInput;
    private EditText estimatedCostInput;
    private Spinner prioritySpinner;
    private Spinner planStatusSpinner;
    private EditText reviewMonthInput;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        planTitleInput = findViewById(R.id.planTitleInput);
        categorySpinner = findViewById(R.id.categorySpinner);
        horizonSpinner = findViewById(R.id.horizonSpinner);
        targetYearInput = findViewById(R.id.targetYearInput);
        estimatedCostInput = findViewById(R.id.estimatedCostInput);
        prioritySpinner = findViewById(R.id.prioritySpinner);
        planStatusSpinner = findViewById(R.id.planStatusSpinner);
        reviewMonthInput = findViewById(R.id.reviewMonthInput);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        bindSpinner(categorySpinner, new String[]{"Family", "Housing", "Work", "Learning", "Health", "Retirement", "Legal"});
        bindSpinner(horizonSpinner, new String[]{"5Y", "10Y", "20Y"});
        bindSpinner(prioritySpinner, new String[]{"High", "Medium", "Low"});
        bindSpinner(planStatusSpinner, new String[]{"Draft", "Active", "Review", "Done"});

        reviewMonthInput.setText("2026-12");

        saveButton.setOnClickListener(v -> saveRecord());
        sampleButton.setOnClickListener(v -> insertSample());
        clearButton.setOnClickListener(v -> clearData());

        render();
    }

    private void bindSpinner(Spinner spinner, String[] items) {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                items
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
    }

    private void saveRecord() {
        try {
            JSONArray arr = readArray();
            JSONObject obj = new JSONObject();
            obj.put("planTitle", textOf(planTitleInput));
            obj.put("category", String.valueOf(categorySpinner.getSelectedItem()));
            obj.put("horizon", String.valueOf(horizonSpinner.getSelectedItem()));
            obj.put("targetYear", textOf(targetYearInput));
            obj.put("estimatedCost", textOf(estimatedCostInput));
            obj.put("priority", String.valueOf(prioritySpinner.getSelectedItem()));
            obj.put("planStatus", String.valueOf(planStatusSpinner.getSelectedItem()));
            obj.put("reviewMonth", textOf(reviewMonthInput));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            planTitleInput.setText("");
            targetYearInput.setText("");
            estimatedCostInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        planTitleInput.setText("Move to new home");
        categorySpinner.setSelection(1);
        horizonSpinner.setSelection(0);
        targetYearInput.setText("2030");
        estimatedCostInput.setText("3000000");
        prioritySpinner.setSelection(0);
        planStatusSpinner.setSelection(1);
        reviewMonthInput.setText("2026-12");
        memoInput.setText("Family timeline sample");
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
        int totalCost = 0;
        int activeCount = 0;
        int familyCount = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String planTitle = obj.optString("planTitle", "");
            String category = obj.optString("category", "");
            String horizon = obj.optString("horizon", "");
            String targetYear = obj.optString("targetYear", "");
            String estimatedCost = obj.optString("estimatedCost", "");
            String priority = obj.optString("priority", "");
            String planStatus = obj.optString("planStatus", "");
            String reviewMonth = obj.optString("reviewMonth", "");
            String memo = obj.optString("memo", "");

            totalCost += parseInt(estimatedCost);

            if ("Active".equals(planStatus)) {
                activeCount += 1;
            }
            if ("Family".equals(category)) {
                familyCount += 1;
            }

            sb.append(planTitle)
              .append(" | ")
              .append(category)
              .append(" | ")
              .append(horizon)
              .append(" | ")
              .append(targetYear)
              .append(" | ")
              .append(estimatedCost)
              .append(" JPY")
              .append("\nPriority: ")
              .append(priority)
              .append(" / Status: ")
              .append(planStatus)
              .append(" / Review: ")
              .append(reviewMonth);

            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Plans: " + count + "\n" +
                "Active: " + activeCount + "\n" +
                "Family Category: " + familyCount + "\n" +
                "Estimated Total: " + totalCost + " JPY"
        );

        recordsText.setText(sb.length() == 0 ? "No plans yet" : sb.toString());
    }
}
