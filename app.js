var app = (function()
{
	// Application object.
	var app = {};

	// Specify your beacon 128bit UUIDs here.
	var regions =
	[
		// Estimote Beacon factory UUID.
		//{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
		// Main beacons tested
		{uuid:'B7E833FD-49D1-49AD-8B23-8C9C5D5B67DE', major: 1, minor: 15045},
		// Sample UUIDs for beacons in our lab.
		//{uuid:'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
		//{uuid:'8DEEFBB9-F738-4297-8040-96668BB44281'},
		//{uuid:'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
		//{uuid:'E20A39F4-73F5-4BC4-A12F-17D1AD07A961'},
		//{uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE'},
		//{uuid:'585CDE93-1B01-42CC-9A13-25009BEDC65E'},	// Dialog Semiconductor.
	];

	// Background detection.
	//var notificationID = 0;
	//var inBackground = false;
	//document.addEventListener('pause', function() { inBackground = true });
	//document.addEventListener('resume', function() { inBackground = false });

	// Dictionary of beacons.
	var beacons = {};
	
	var inSearch = 0;

	// Timer that displays list of beacons.
	var updateTimer = null;
	var updateTimerSearch = null;
	
	//evothings.scriptsLoaded(onDeviceReady)
	
	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { onDeviceReady() },
			false);
	};

	function onDeviceReady()
	{
		alert('startScan');
		// Specify a shortcut for the location manager holding the iBeacon functions.
		window.locationManager = cordova.plugins.locationManager;

		// Start tracking beacons!
		startScan();

		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 1000);
	}
	
	function startStopSearch(beaconRegionsss){
		alert('startStopSearch');
		alert(inSearch);
		
		if(inSearch==0){
			alert('try to stop');
			/*var beaconRegionnnn = new locationManager.BeaconRegion(
				0, regions[i].uuid, regions[i].major, regions[i].minor);*/
			alert(beaconRegionsss);
			
			locationManager.stopRangingBeaconsInRegion(beaconRegionsss)
				.fail(console.error)
				.done();
				
			alert('stoped ranging');
			inSearch=1;
		}
	}
	
	function startScan()
	{
		// The delegate object holds the iBeacon callback functions
		// specified below.
		var delegate = new locationManager.Delegate();

		// Called continuously when ranging beacons.
		delegate.didRangeBeaconsInRegion = function(pluginResult)
		{
			//alert('didRangeBeaconsInRegion');
			//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
			for (var i in pluginResult.beacons)
			{
				// Insert beacon into table of found beacons.
				var beacon = pluginResult.beacons[i];
				beacon.timeStamp = Date.now();
				var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
				beacons[key] = beacon;
			}
		};

		// Called when starting to monitor a region.
		// (Not used in this example, included as a reference.)
		delegate.didStartMonitoringForRegion = function(pluginResult)
		{
			alert('didStartMonitoringForRegion');
			//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
		};

		// Called when monitoring and the state of a region changes.
		// If we are in the background, a notification is shown.
		delegate.didDetermineStateForRegion = function(pluginResult)
		{
			alert('didDetermineStateForRegion');
			/*if (inBackground)
			{
				// Show notification if a beacon is inside the region.
				// TODO: Add check for specific beacon(s) in your app.
				if (pluginResult.region.typeName == 'BeaconRegion' &&
					pluginResult.state == 'CLRegionStateInside')
				{
					cordova.plugins.notification.local.schedule(
						{
							id: ++notificationID,
							title: 'Beacon in range',
							text: 'iBeacon Scan detected a beacon, tap here to open app.'
						});
				}
			}*/
		};
		
		locationManager.isBluetoothEnabled()
			.then(function(isEnabled){
				console.log("isEnabled: " + isEnabled);
				if (isEnabled) {
					//cordova.plugins.locationManager.disableBluetooth();
				} else {
					cordova.plugins.locationManager.enableBluetooth();        
				}
			})
			.fail(console.error)
			.done();
		
		// Set the delegate object to use.
		locationManager.setDelegate(delegate);

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		locationManager.requestAlwaysAuthorization();

		// Start monitoring and ranging beacons.
		for (var i in regions)
		{
			alert('region '+i);
			var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid, regions[i].major, regions[i].minor);

			// Start ranging.
			locationManager.startRangingBeaconsInRegion(beaconRegion)
				.fail(console.error)
				.done();
				
			//updateTimerSearch = setInterval(startStopSearch(beaconRegion), 3000
			setInterval(function (){
				alert('startStopSearch');
				alert(inSearch);
				
				if(inSearch==0){
					alert('try to stop');
					/*var beaconRegionnnn = new locationManager.BeaconRegion(
						0, regions[i].uuid, regions[i].major, regions[i].minor);*/
					alert(beaconRegion);
					
					locationManager.stopRangingBeaconsInRegion(beaconRegion)
						.fail(console.error)
						.done();
						
					alert('stoped ranging');
					inSearch=1;
				} else {
					alert('try to start');
					locationManager.startRangingBeaconsInRegion(beaconRegion)
						.fail(console.error)
						.done();
					alert('started again..');
					inSearch=0;
				}
			}
			, 2000);
			

			// Start monitoring.
			// (Not used in this example, included as a reference.)
			/*
			locationManager.startMonitoringForRegion(beaconRegion)
				.fail(console.error)
				.done();*/
		}
	}

	function displayBeaconList()
	{
		// Clear beacon list.
		$('#found-beacons').empty();

		var timeNow = Date.now();

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Map the RSSI value to a width in percent for the indicator.
				var rssiWidth = 1; // Used when RSSI is zero or greater.
				if (beacon.rssi < -100) { rssiWidth = 100; }
				else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	'Proximity: ' + beacon.proximity + '<br />'
					+	'Accuracy: ' + beacon.accuracy + '<br />'
					+	'Distance: ' + beacon.distance + '<br />'
					+	'MacAddress: ' + beacon.macAddress + '<br />'
					+	'MeasuredPower: ' + beacon.measuredPower + '<br />'
					+	'ALL: ' + JSON.stringify(beacon) + '<br />'
					+	'RSSI: ' + beacon.rssi + '<br />'
					+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
					+ 		rssiWidth + '%;"></div>'
					+ '</li>'
				);

				$('#warning, #fountainG').remove();
				$('#found-beacons').append(element);
			}
		});
	}

	return app;
})();

app.initialize();
