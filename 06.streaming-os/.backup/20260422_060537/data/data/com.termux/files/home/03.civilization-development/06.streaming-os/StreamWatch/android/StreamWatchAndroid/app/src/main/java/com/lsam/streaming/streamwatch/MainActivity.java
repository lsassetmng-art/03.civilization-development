package com.lsam.streaming.streamwatch;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    private TextView titleText;
    private TextView subtitleText;
    private MaterialButton personaButton;
    private MaterialButton backgroundButton;
    private MaterialButton primaryActionButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        titleText = findViewById(R.id.titleText);
        subtitleText = findViewById(R.id.subtitleText);
        personaButton = findViewById(R.id.personaButton);
        backgroundButton = findViewById(R.id.backgroundButton);
        primaryActionButton = findViewById(R.id.primaryActionButton);

        titleText.setText(getString(R.string.screen_title));
        subtitleText.setText(getString(R.string.screen_subtitle));

        personaButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.persona_change_message))
        );

        backgroundButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.background_change_message))
        );

        primaryActionButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.primary_action_message))
        );
    }
}
