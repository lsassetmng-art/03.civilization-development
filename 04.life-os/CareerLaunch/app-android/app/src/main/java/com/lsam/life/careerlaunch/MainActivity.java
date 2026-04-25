package com.lsam.life.careerlaunch;

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
    private static final String PREFS = "careerlaunch_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText companyInput;
    private EditText positionInput;
    private Spinner stageSpinner;
    private EditText dueDateInput;
    private EditText noteInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        companyInput = findViewById(R.id.companyInput);
        positionInput = findViewById(R.id.positionInput);
        stageSpinner = findViewById(R.id.stageSpinner);
        dueDateInput = findViewById(R.id.dueDateInput);
        noteInput = findViewById(R.id.noteInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        ArrayAdapter<String> stageAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"Draft", "Applied", "Interview", "Offer", "Closed"}
        );
        stageAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        stageSpinner.setAdapter(stageAdapter);

        dueDateInput.setText("2026-04-21");

        saveButton.setOnClickListener(v -> saveRecord());
        sampleButton.setOnClickListener(v -> insertSample());
        clearButton.setOnClickListener(v -> clearData());

        render();
    }

    private void saveRecord() {
        try {
            JSONArray arr = readArray();
            JSONObject obj = new JSONObject();
            obj.put("company", textOf(companyInput));
            obj.put("position", textOf(positionInput));
            obj.put("stage", String.valueOf(stageSpinner.getSelectedItem()));
            obj.put("dueDate", textOf(dueDateInput));
            obj.put("note", textOf(noteInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            companyInput.setText("");
            positionInput.setText("");
            noteInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        companyInput.setText("OpenAI Japan");
        positionInput.setText("Product Manager");
        stageSpinner.setSelection(1);
        dueDateInput.setText("2026-04-21");
        noteInput.setText("Resume submitted sample");
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

    private int countStage(JSONArray arr, String stage) {
        int count = 0;
        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj != null && stage.equals(obj.optString("stage", ""))) {
                count += 1;
            }
        }
        return count;
    }

    private void render() {
        JSONArray arr = readArray();
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String company = obj.optString("company", "");
            String position = obj.optString("position", "");
            String stage = obj.optString("stage", "");
            String dueDate = obj.optString("dueDate", "");
            String note = obj.optString("note", "");

            sb.append(company)
              .append(" | ")
              .append(position)
              .append(" | ")
              .append(stage)
              .append(" | due ")
              .append(dueDate);
            if (!note.isEmpty()) {
                sb.append("\n").append(note);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Applications: " + arr.length() + "\n" +
                "Applied: " + countStage(arr, "Applied") + "\n" +
                "Interview: " + countStage(arr, "Interview") + "\n" +
                "Offer: " + countStage(arr, "Offer")
        );

        recordsText.setText(sb.length() == 0 ? "No applications yet" : sb.toString());
    }
}
