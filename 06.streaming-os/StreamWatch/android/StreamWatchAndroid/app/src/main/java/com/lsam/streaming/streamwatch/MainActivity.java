package com.lsam.streaming.streamwatch;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.lsam.streaming.streamwatch.commonos.CommonRuntimePolicy;
import com.lsam.streaming.streamwatch.commonos.DisplayModelMapper;
import com.lsam.streaming.streamwatch.commonos.OsCommonConsumerRef;

public class MainActivity extends AppCompatActivity {

    private TextView titleText;
    private TextView subtitleText;
    private TextView commonSurfaceSummaryText;
    private TextView localSurfaceSummaryText;
    private TextView consumerRootText;
    private TextView consumerFilesText;
    private TextView mapperScopeText;
    private EditText searchInput;
    private MaterialButton primaryActionButton;
    private MaterialButton libraryButton;
    private MaterialButton tvHandoffButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        titleText = findViewById(R.id.titleText);
        subtitleText = findViewById(R.id.subtitleText);
        commonSurfaceSummaryText = findViewById(R.id.commonSurfaceSummaryText);
        localSurfaceSummaryText = findViewById(R.id.localSurfaceSummaryText);
        consumerRootText = findViewById(R.id.consumerRootText);
        consumerFilesText = findViewById(R.id.consumerFilesText);
        mapperScopeText = findViewById(R.id.mapperScopeText);
        searchInput = findViewById(R.id.searchInput);
        primaryActionButton = findViewById(R.id.primaryActionButton);
        libraryButton = findViewById(R.id.libraryButton);
        tvHandoffButton = findViewById(R.id.tvHandoffButton);

        titleText.setText(getString(R.string.screen_title));
        subtitleText.setText(getString(R.string.screen_subtitle));
        commonSurfaceSummaryText.setText(joinList(CommonRuntimePolicy.getCommonPreferredSurfaces()));
        localSurfaceSummaryText.setText(joinList(CommonRuntimePolicy.getStreamingLocalSurfaces()));
        consumerRootText.setText(OsCommonConsumerRef.CONSUMER_ROOT);
        consumerFilesText.setText(
            OsCommonConsumerRef.ADAPTER_FILE + "\n" +
            OsCommonConsumerRef.BRIDGE_FILE + "\n" +
            OsCommonConsumerRef.MAPPER_FILE
        );
        mapperScopeText.setText(DisplayModelMapper.describeMappingScope());

        primaryActionButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.resume_message))
        );

        libraryButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.library_message))
        );

        tvHandoffButton.setOnClickListener(v ->
            subtitleText.setText(getString(R.string.tv_handoff_message))
        );

        searchInput.setHint(getString(R.string.search_hint));
    }

    private String joinList(java.util.List<String> items) {
        return android.text.TextUtils.join(", ", items);
    }
}
