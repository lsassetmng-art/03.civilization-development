package com.lsam.life.inheritancesupport;

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
    private static final String PREFS = "inheritancesupport_prefs";
    private static final String KEY_RECORDS = "records";

    private SharedPreferences prefs;
    private EditText caseNameInput;
    private Spinner itemTypeSpinner;
    private EditText ownerNameInput;
    private EditText amountInput;
    private EditText dueDateInput;
    private Spinner statusSpinner;
    private Spinner sharingSpinner;
    private Spinner prioritySpinner;
    private EditText memoInput;
    private TextView summaryText;
    private TextView recordsText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);

        caseNameInput = findViewById(R.id.caseNameInput);
        itemTypeSpinner = findViewById(R.id.itemTypeSpinner);
        ownerNameInput = findViewById(R.id.ownerNameInput);
        amountInput = findViewById(R.id.amountInput);
        dueDateInput = findViewById(R.id.dueDateInput);
        statusSpinner = findViewById(R.id.statusSpinner);
        sharingSpinner = findViewById(R.id.sharingSpinner);
        prioritySpinner = findViewById(R.id.prioritySpinner);
        memoInput = findViewById(R.id.memoInput);
        summaryText = findViewById(R.id.summaryText);
        recordsText = findViewById(R.id.recordsText);

        Button saveButton = findViewById(R.id.saveButton);
        Button sampleButton = findViewById(R.id.sampleButton);
        Button clearButton = findViewById(R.id.clearButton);

        bindSpinner(itemTypeSpinner, new String[]{"Heir", "Asset", "Debt", "Document", "Consultation", "Deadline"});
        bindSpinner(statusSpinner, new String[]{"Draft", "In Review", "Ready", "Done"});
        bindSpinner(sharingSpinner, new String[]{"Private", "Family View", "Advisor View"});
        bindSpinner(prioritySpinner, new String[]{"High", "Medium", "Low"});

        dueDateInput.setText("2026-04-21");

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
            obj.put("caseName", textOf(caseNameInput));
            obj.put("itemType", String.valueOf(itemTypeSpinner.getSelectedItem()));
            obj.put("ownerName", textOf(ownerNameInput));
            obj.put("amount", textOf(amountInput));
            obj.put("dueDate", textOf(dueDateInput));
            obj.put("status", String.valueOf(statusSpinner.getSelectedItem()));
            obj.put("sharing", String.valueOf(sharingSpinner.getSelectedItem()));
            obj.put("priority", String.valueOf(prioritySpinner.getSelectedItem()));
            obj.put("memo", textOf(memoInput));
            arr.put(obj);
            prefs.edit().putString(KEY_RECORDS, arr.toString()).apply();

            caseNameInput.setText("");
            ownerNameInput.setText("");
            amountInput.setText("");
            memoInput.setText("");
            render();
        } catch (Exception e) {
            summaryText.setText("Save failed");
        }
    }

    private void insertSample() {
        caseNameInput.setText("Parent inheritance prep");
        itemTypeSpinner.setSelection(1);
        ownerNameInput.setText("Father");
        amountInput.setText("5000000");
        dueDateInput.setText("2026-04-21");
        statusSpinner.setSelection(1);
        sharingSpinner.setSelection(1);
        prioritySpinner.setSelection(0);
        memoInput.setText("Initial asset inventory sample");
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
        int assetTotal = 0;
        int debtTotal = 0;
        int heirCount = 0;
        int deadlineCount = 0;
        StringBuilder sb = new StringBuilder();

        for (int i = arr.length() - 1; i >= 0; i--) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            String caseName = obj.optString("caseName", "");
            String itemType = obj.optString("itemType", "");
            String ownerName = obj.optString("ownerName", "");
            String amount = obj.optString("amount", "");
            String dueDate = obj.optString("dueDate", "");
            String status = obj.optString("status", "");
            String sharing = obj.optString("sharing", "");
            String priority = obj.optString("priority", "");
            String memo = obj.optString("memo", "");

            int amountNum = parseInt(amount);
            if ("Asset".equals(itemType)) {
                assetTotal += amountNum;
            }
            if ("Debt".equals(itemType)) {
                debtTotal += amountNum;
            }
            if ("Heir".equals(itemType)) {
                heirCount += 1;
            }
            if ("Deadline".equals(itemType)) {
                deadlineCount += 1;
            }

            sb.append(caseName)
              .append(" | ")
              .append(itemType)
              .append("\nOwner or Person: ")
              .append(ownerName)
              .append(" / Amount: ")
              .append(amount)
              .append(" JPY")
              .append("\nDue: ")
              .append(dueDate)
              .append(" / Status: ")
              .append(status)
              .append(" / Sharing: ")
              .append(sharing)
              .append(" / Priority: ")
              .append(priority);

            if (!memo.isEmpty()) {
                sb.append("\n").append(memo);
            }
            sb.append("\n\n");
        }

        summaryText.setText(
                "Items: " + count + "\n" +
                "Heirs: " + heirCount + "\n" +
                "Assets: " + assetTotal + " JPY\n" +
                "Debts: " + debtTotal + " JPY\n" +
                "Deadlines: " + deadlineCount
        );

        recordsText.setText(sb.length() == 0 ? "No inheritance items yet" : sb.toString());
    }
}
