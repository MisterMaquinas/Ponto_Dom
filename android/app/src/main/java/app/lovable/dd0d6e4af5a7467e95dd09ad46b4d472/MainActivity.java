package app.lovable.dd0d6e4af5a7467e95dd09ad46b4d472;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MLKitPlugin.class);
        super.onCreate(savedInstanceState);
    }
}