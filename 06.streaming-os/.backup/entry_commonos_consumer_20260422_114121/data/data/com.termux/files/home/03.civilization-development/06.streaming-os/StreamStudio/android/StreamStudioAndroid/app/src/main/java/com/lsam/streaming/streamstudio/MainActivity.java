package com.lsam.streaming.streamstudio;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.lsam.streaming.streamstudio.commonos.CommonRuntimePolicy;

public class MainActivity extends AppCompatActivity {

    private TextView titleText;
    private TextView subtitleText;
    private TextView commonSurfaceSummaryText;
    private TextView localSurfaceSummaryText;
    private EditText searchInput;
    private MaterialButton projectButton;
    private MaterialButton publishQueueButton;
    private MaterialButton syncButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        titleText = findViewById(R.id.titleText);
        subtitleText = findViewById(R.id.subtitleText);
        commonSurfaceSummaryText = findViewById(R.id.commonSurfaceSummaryText);
        localSurfaceSummaryText = findViewById(R.id.localSurfaceSummaryText);
        searchInput = findViewById(R.id.searchInput);
        projectButton = findViewById(R.id.projectButton);
        publishQueueButton = findViewById(R.id.publishQueueButton);
        syncButton = findViewById(R.id.syncButton);

        titleText.setText(getString(R.string.screen_title));
        subtitleText.setText(getString(R.string.screen_subtitle));
        commonSurfaceSummaryText.setText(joinList(CommonRuntimePolicy.getCommonPreferredSurfaces()));
        localSurfaceSummaryText.setText(joinList(CommonRuntimePolicy.getStreamingLocalSurfaces()));

        projectButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.projects_message))
        );

        publishQueueButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.publish_queue_message))
        );

        syncButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.sync_message))
        );

        searchInput.setHint(getString(R.string.search_hint));
    }

    private String joinList(java.util.List<String> items) {
        return android.text.TextUtils.join(", ", items);
    }
}
