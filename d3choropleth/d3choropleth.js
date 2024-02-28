document.addEventListener("DOMContentLoaded", () => {

    async function Fetch() {
        let res = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
        let educationData = await res.json();
        res = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
        let mapData = await res.json();
    
        const w = 1000; // canvas width
        const h = 600; // canvas height
        const p = 0; //canvas padding
        
        const svg = d3
            .select("#container")
            .append("svg")
            .attr("height", h)
            .attr("width", w)
        
        const colorPalette = d3
            .scaleLinear()
            .domain([d3.min(educationData, (d) => d.bachelorsOrHigher), d3.max(educationData, (d) => d.bachelorsOrHigher)])
            .range(["#E7FEE6", "#4B8D46", "#043400"])
        
        const nation = topojson
            .feature(mapData, mapData.objects.nation).features
        
        svg
            .selectAll(".nation")
            .data(nation)
            .enter().append("path")
            .attr("class", "nation")
            .attr("d", d3.geoPath())
            .attr("fill", "none")
        
        const counties = topojson
            .feature(mapData, mapData.objects.counties).features
    
        svg
            .selectAll(".county")
            .data(counties)
            .enter().append("path")
            .attr("class", (d) => `county county-${d.id}`)
            .attr("d", d3.geoPath())
            .attr("fill", (d) => {
                for(let i = 0; i < educationData.length; i++) {
                    if(educationData[i].fips == d.id) {
                        return colorPalette(educationData[i].bachelorsOrHigher)
                    }
                }
            })
        
        const states = topojson
            .feature(mapData, mapData.objects.states).features
        
        svg
            .selectAll(".state")
            .data(states)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", d3.geoPath())
            .attr("fill", "none")
    
        d3.select("#container")
            .select(".tooltip")
            .data(counties)
            .enter().append("div")
            .attr("class", (d) => `tooltip tooltip-${d.id}`)
        
        let county = Array.from(document.querySelectorAll(".county"));
    
        class Data {
            constructor(county, state, percentage, id) {
                this.id = id;
                this.county = county;
                this.state = state;
                this.percentage = percentage;
            }
        }
        
        let data = [];
        county.forEach((item, index) => {
            for(let i = 0; i < educationData.length; i++) {
                if(item.classList.contains(`county-${educationData[i].fips}`)) {
                    data.push(new Data(educationData[i].area_name, educationData[i].state, educationData[i].bachelorsOrHigher, educationData[i].fips));
                    break;
                }
            }
            
            document.querySelector(`.tooltip-${data[index].id}`).innerHTML = `${data[index].county}, ${data[index].state}: ${data[index].percentage}%`;
            
            item.addEventListener("mouseenter", (event) => {
                document.querySelector(`.tooltip-${data[index].id}`).style.left = `${event.clientX + 20}px`;
                document.querySelector(`.tooltip-${data[index].id}`).style.top = `${event.clientY - 40}px`;
                document.querySelector(`.tooltip-${data[index].id}`).style.display = "block";
            });
            
            item.addEventListener("mouseleave", () => {
                document.querySelector(`.tooltip-${data[index].id}`).style.display = "none";
            });
        });
        
        const legend = [3, 12, 21, 30, 39, 48, 57, 66];
        
        const legendColorPalette = d3
            .scaleLinear()
            .domain([d3.min(legend, (d) => d), d3.max(legend, (d) => d)])
            .range(["#E7FEE6", "#4B8D46", "#043400"])
        
        const legendX = 540;
        const legendY = 40;
        const legendW = 40;
        const legendH = 10;
        
        svg
            .selectAll("rect")
            .data(legend.slice(1, legend.length))
            .enter()
            .append("rect")
            .attr("width", legendW)
            .attr("height", legendH)
            .attr("x", (d, i) => legendX + (i + 1) * legendW)
            .attr("y", legendY - legendH)
            .attr("fill", (d) => legendColorPalette(d))
        
        const legendScale = d3.scaleLinear()
                                                    .domain([d3.min(legend, (d) => d), d3.max(legend, (d) => d)])
                                                    .range([legendX + legendW, legendX + legendW * legend.length])
        
        const legendAxis = d3.axisBottom(legendScale)
                                                    .tickValues([3, 12, 21, 30, 39, 48, 57, 66])
                                                    .tickFormat((d, i) => ["3%", "12%", "21%", "30%", "39%", "48%", "57%", "66%"][i])
        
        svg
            .append("g")
            .call(legendAxis)
            .attr("id", "legend")
            .attr("transform", `translate(0, ${legendY})`)
    }
    Fetch();

})