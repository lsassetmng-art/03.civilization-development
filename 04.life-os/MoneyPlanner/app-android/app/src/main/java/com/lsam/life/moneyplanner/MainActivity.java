package com.lsam.life.moneyplanner;

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
    private static final String PREFS = "moneyplanner_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText dateInput;
    private Spinner typeSpinner;
    private EditText categoryInput;
    private EditText amountInput;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        dateInput = findViewById(R.id.dateInput);
        typeSpinner = findViewById(R.id.typeSpinner);
        categoryInput = findViewById(R.id.categoryInput);
        amountInput = findViewById(R.id.amountInput);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"Income", "Expense"}
        );
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeSpinner.setAdapter(typeAdapter);

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
            obj.put("type", String.valueOf(typeSpinner.getSelectedItem()));
            obj.put("category", textOf(categoryInput));
            obj.put("amount", textOf(amountInput));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            categoryInput.setText("");
            amountInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        dateInput.setText("2026-04-21");
        typeSpinner.setSelection(1);
        categoryInput.setText("Food");
        amountInput.setText("1200");
        memoInput.setText("Lunch sample");
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
        int income = 0;
        int expense = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String date = obj.optString("date", "");
            String type = obj.optString("type", "");
            String category = obj.optString("category", "");
            String amount = obj.optString("amount", "");
            String memo = obj.optString("memo", "");

            int amountNum = parseInt(amount);
            if ("Income".equals(type)) {
                income += amountNum;
            } else {
                expense += amountNum;
            }

            sb.append(date)
              .append(" | ")
              .append(type)
              .append(" | ")
              .append(category)
              .append(" | ")
              .append(amount)
              .append(" JPY");
            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Entries: " + count + "\n" +
                "Income: " + income + " JPY\n" +
                "Expense: " + expense + " JPY\n" +
                "Balance: " + (income - expense) + " JPY"
        );

        recordsText.setText(sb.length() == 0 ? "No entries yet" : sb.toString());
    }
}
