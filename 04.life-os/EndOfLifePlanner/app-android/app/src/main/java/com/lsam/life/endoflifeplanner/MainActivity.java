package com.lsam.life.endoflifeplanner;

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
    private static final String PREFS = "endoflifeplanner_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private Spinner entryTypeSpinner;
    private EditText titleInput;
    private Spinner statusSpinner;
    private Spinner visibilitySpinner;
    private EditText targetPersonInput;
    private EditText reviewDateInput;
    private EditText contactOrLocationInput;
    private Spinner importanceSpinner;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        entryTypeSpinner = findViewById(R.id.entryTypeSpinner);
        titleInput = findViewById(R.id.titleInput);
        statusSpinner = findViewById(R.id.statusSpinner);
        visibilitySpinner = findViewById(R.id.visibilitySpinner);
        targetPersonInput = findViewById(R.id.targetPersonInput);
        reviewDateInput = findViewById(R.id.reviewDateInput);
        contactOrLocationInput = findViewById(R.id.contactOrLocationInput);
        importanceSpinner = findViewById(R.id.importanceSpinner);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        bindSpinner(entryTypeSpinner, new String[]{
                "Medical Preference",
                "Care Preference",
                "Funeral Preference",
                "Digital Asset",
                "Contact",
                "Document"
        });
        bindSpinner(statusSpinner, new String[]{"Draft", "Ready", "Shared"});
        bindSpinner(visibilitySpinner, new String[]{"Private", "Family View", "Advisor View"});
        bindSpinner(importanceSpinner, new String[]{"High", "Medium", "Low"});

        reviewDateInput.setText("2026-04-21");

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
            obj.put("entryType", String.valueOf(entryTypeSpinner.getSelectedItem()));
            obj.put("title", textOf(titleInput));
            obj.put("status", String.valueOf(statusSpinner.getSelectedItem()));
            obj.put("visibility", String.valueOf(visibilitySpinner.getSelectedItem()));
            obj.put("targetPerson", textOf(targetPersonInput));
            obj.put("reviewDate", textOf(reviewDateInput));
            obj.put("contactOrLocation", textOf(contactOrLocationInput));
            obj.put("importance", String.valueOf(importanceSpinner.getSelectedItem()));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            titleInput.setText("");
            targetPersonInput.setText("");
            contactOrLocationInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        entryTypeSpinner.setSelection(5);
        titleInput.setText("Emergency contact list");
        statusSpinner.setSelection(1);
        visibilitySpinner.setSelection(1);
        targetPersonInput.setText("Spouse");
        reviewDateInput.setText("2026-04-21");
        contactOrLocationInput.setText("Home cabinet A-2");
        importanceSpinner.setSelection(0);
        memoInput.setText("Reviewed once every quarter");
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

    private void render() {
        JSONArray arr = readArray();
        int count = arr.length();
        int readyCount = 0;
        int sharedCount = 0;
        int documentCount = 0;
        int contactCount = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String entryType = obj.optString("entryType", "");
            String title = obj.optString("title", "");
            String status = obj.optString("status", "");
            String visibility = obj.optString("visibility", "");
            String targetPerson = obj.optString("targetPerson", "");
            String reviewDate = obj.optString("reviewDate", "");
            String contactOrLocation = obj.optString("contactOrLocation", "");
            String importance = obj.optString("importance", "");
            String memo = obj.optString("memo", "");

            if ("Ready".equals(status)) {
                readyCount += 1;
            }
            if ("Shared".equals(status)) {
                sharedCount += 1;
            }
            if ("Document".equals(entryType)) {
                documentCount += 1;
            }
            if ("Contact".equals(entryType)) {
                contactCount += 1;
            }

            sb.append(title)
              .append(" | ")
              .append(entryType)
              .append("\nStatus: ")
              .append(status)
              .append(" / Visibility: ")
              .append(visibility)
              .append(" / Importance: ")
              .append(importance)
              .append("\nTarget: ")
              .append(targetPerson)
              .append(" / Review: ")
              .append(reviewDate)
              .append(" / Contact or Location: ")
              .append(contactOrLocation);

            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Entries: " + count + "\n" +
                "Ready: " + readyCount + "\n" +
                "Shared: " + sharedCount + "\n" +
                "Documents: " + documentCount + "\n" +
                "Contacts: " + contactCount
        );

        recordsText.setText(sb.length() == 0 ? "No end-of-life entries yet" : sb.toString());
    }
}
