package com.lsam.life.bodymetrics;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String PREFS = "bodymetrics_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText dateInput;
    private EditText weightInput;
    private EditText bodyFatInput;
    private EditText sleepInput;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        dateInput = findViewById(R.id.dateInput);
        weightInput = findViewById(R.id.weightInput);
        bodyFatInput = findViewById(R.id.bodyFatInput);
        sleepInput = findViewById(R.id.sleepInput);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

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
            obj.put("weight", textOf(weightInput));
            obj.put("bodyFat", textOf(bodyFatInput));
            obj.put("sleep", textOf(sleepInput));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            weightInput.setText("");
            bodyFatInput.setText("");
            sleepInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        dateInput.setText("2026-04-21");
        weightInput.setText("62.4");
        bodyFatInput.setText("18.2");
        sleepInput.setText("7.3");
        memoInput.setText("Morning sample");
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

    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 0.0;
        }
    }

    private void render() {
        JSONArray arr = readArray();
        int count = arr.length();
        double weightSum = 0.0;
        int weightCount = 0;
        double sleepSum = 0.0;
        int sleepCount = 0;
        String latestWeight = "-";
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String date = obj.optString("date", "");
            String weight = obj.optString("weight", "");
            String bodyFat = obj.optString("bodyFat", "");
            String sleep = obj.optString("sleep", "");
            String memo = obj.optString("memo", "");

            if (i == arr.length() - 1 && !weight.isEmpty()) {
                latestWeight = weight;
            }

            double weightNum = parseDouble(weight);
            if (weightNum > 0) {
                weightSum += weightNum;
                weightCount += 1;
            }

            double sleepNum = parseDouble(sleep);
            if (sleepNum > 0) {
                sleepSum += sleepNum;
                sleepCount += 1;
            }

            sb.append(date)
              .append(" | ")
              .append(weight)
              .append(" kg | body fat ")
              .append(bodyFat)
              .append("% | sleep ")
              .append(sleep)
              .append("h");
            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        String avgWeight = weightCount > 0 ? String.format("%.1f", weightSum / weightCount) : "-";
        String avgSleep = sleepCount > 0 ? String.format("%.1f", sleepSum / sleepCount) : "-";

        summaryText.setText(
                "Records: " + count + "\n" +
                "Latest Weight: " + latestWeight + "\n" +
                "Average Weight: " + avgWeight + "\n" +
                "Average Sleep: " + avgSleep
        );

        recordsText.setText(sb.length() == 0 ? "No records yet" : sb.toString());
    }
}
