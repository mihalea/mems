var margin = { top: 50, right: 0, bottom: 100, left: 30 },
	width = 960 - margin.left - margin.right,
	height = 430 - margin.top - margin.bottom,
	gridSize = Math.floor(width / 24),
	legendElementWidth = gridSize*2,
	buckets = 9,
	colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
	days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
	times = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dayLabels = svg.selectAll(".dayLabel")
	.data(days)
	.enter().append("text")
	.text(function (d) { return d; })
	.attr("x", 0)
	.attr("y", function (d, i) { return i * gridSize; })
	.style("text-anchor", "end")
	.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
	//.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });
	.attr("class", "dayLabel mono axis axis-workweek");

var timeLabels = svg.selectAll(".timeLabel")
	.data(times)
	.enter().append("text")
	.text(function(d) { return d; })
	.attr("x", function(d, i) { return i * gridSize; })
	.attr("y", 0)
	.style("text-anchor", "middle")
	.attr("transform", "translate(" + gridSize / 2 + ", -6)")
    //.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
	.attr("class", "dayLabel mono axis axis-workweek");

d3.csv("memes.csv",
    function(d) {
        return {
            year: +d.year,
            month: +d.month,
            day: +d.day,
            weekday: +d.weekday,
            hour: +d.hour,
            minute: +d.minute,
            second: +d.second,
            file: d.file
        };
    }).then(
        function(data) {
            var rolled = d3.rollup(data, d => d.length, d => d.weekday, d => d.hour);
            values = []
            rolled.forEach((wd_arr, wd, mw) => {
                wd_arr.forEach((count, hr, mh) => {
                    values.push({
                        day: wd,
                        hour: hr,
                        value: count
                    });
                });
            });

            const ckmeansClusters = ss.ckmeans(values.map(d => d.value), buckets);
            const ckmeansBreaks = ckmeansClusters.map(d => d3.min(d));

			var ckColor = function(value) {
				var idx = 0;
				while (idx < ckmeansBreaks.length && ckmeansBreaks[idx] < value) {
					idx++;
				}
				return colors[idx];
			};

            var cards = svg.selectAll(".hour")
                .data(values, function(d) {return d.day+':'+d.hour;});

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.hour) * gridSize; })
                .attr("y", function(d) { return (d.day) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", d => ckColor(d.value));

            cards.select("title").text(function(d) { return d.value; });

            cards.exit().remove();

            var legend = svg.selectAll(".legend")
                .data(colors);

            legend.enter().append("g")
                .attr("class", "legend");

            legend.enter().append("rect")
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", d => d);

            legend.enter().append("text")
                .attr("class", "mono")
                .text((d, i) => "≥ " + ckmeansBreaks[i])
                .attr("x", function(d, i) { return legendElementWidth * i; })
                .attr("y", height + gridSize);

            legend.exit().remove();
        });
