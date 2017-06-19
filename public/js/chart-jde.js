var socket = io();

var chartOptions = {
    chart: {
        renderTo: 'container',
        type: 'bar'
    },
    title: {
        text: 'Item availability'
    },
    subtitle: {
        text: 'Source: JDE EnterpriseOne, Forza DV910'
    },
    xAxis: {
        categories: ['Items'],
        title: {
            text: null
        }
    },
    yAxis: {
        title: {
            text: 'Availability',
            align: 'high'
        },
        labels: {
            overflow: 'justify'
        }
    },
    tooltip: {
        valueSuffix: ' primary UOM'
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true
            }
        }
    },
    // legend: {
    //     layout: 'vertical',
    //     align: 'right',
    //     verticalAlign: 'top',
    //     x: -40,
    //     y: 80,
    //     floating: true,
    //     borderWidth: 1,
    //     backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
    //     shadow: true
    // },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Availability',
        data: [0]
    }]
}

var highChartIns = null;

socket.on('connect', function () {
    console.log('Connected to server');

    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No Error');

        }
    });

});

socket.on('loggedIn', function () {
    console.log('Logged in successfully');

    drawHighChart();

    socket.emit('getAvailabilityData');

    timerFunction();
});

socket.on('invalidJDEUser', function () {
    alert('Cannot login into JDE. Please check your username and password');
    window.location.href = '/';
});

socket.on('disconnect', function () {
    console.log('Server disconnected');
});

function drawHighChart() {
    highChartIns = new Highcharts.chart(chartOptions);
}

socket.on('updateAvailabilityData', function (itemAvailabilityData) {

    highChartIns.xAxis[0].setCategories(itemAvailabilityData.itemNames, true);
    highChartIns.series[0].setData(itemAvailabilityData.itemAvailableNos, true);
});

function timerFunction() {
    setInterval(function () {
        socket.emit('getAvailabilityData');
    }, 10000);
}