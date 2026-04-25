package com.lsam.life.businesslegalsupport;

import android.app.Activity;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Spinner backgroundSpinner = findViewById(R.id.backgroundSpinner);
        EditText personaInput = findViewById(R.id.personaInput);
        Button saveButton = findViewById(R.id.saveButton);

        String[] backgrounds = new String[] {"Sunrise", "Forest", "Night"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                backgrounds
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        backgroundSpinner.setAdapter(adapter);

        saveButton.setOnClickListener(v -> {
            String ignoredPersona = personaInput.getText().toString();
            String ignoredBackground = String.valueOf(backgroundSpinner.getSelectedItem());
        });
    }
}
