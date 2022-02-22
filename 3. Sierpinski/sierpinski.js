function createTriangle(ctx, level, top, right, left)
{
    if(level == 0)
    {
        ctx.fillStyle = 'rgba(241, 134, 189, 0.8)';
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(left.x, left.y);
        ctx.fill();
    }

    if(level >= 1)
    {
        const new_left = {
            x: (top.x + left.x) / 2,
            y: (left.y + top.y) / 2
        };
        
        const new_right = {
            x: top.x + (right.x - top.x) / 2,
            y: (left.y + top.y) / 2
        };
        
        const bottom = {
            x: top.x,
            y: right.y
        };

        ctx.fillStyle = 'rgba(0, 255, 255, 1)';
        ctx.beginPath();
        ctx.moveTo(new_left.x, new_left.y);
        ctx.lineTo(new_right.x, new_right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.fill();

        createTriangle(ctx, level-1, top, new_right, new_left);
        createTriangle(ctx, level-1, new_left, bottom, left);
        createTriangle(ctx, level-1, new_right, bottom, right);
    }
}

function main()
{
    let canvas = document.getElementById("htmlCanvas");

    if(!canvas)
    {
        console.log("Failed to load the canvas element.");
        return;
    }

    let ctx = canvas.getContext("2d");

    var w = 400;
    var h = 400;

    var slider = document.getElementById("myRange");
    var output = document.getElementById("number");
    output.innerHTML = slider.value;

    slider.oninput = (event) => {
        output.innerHTML = event.target.value;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        createTriangle(ctx, event.target.value, {x: w/2, y: 0}, {x: w, y: h}, {x: 0, y: h});
    }

    createTriangle(ctx, 0, {x: w/2, y: 0}, {x: w, y: h}, {x: 0, y: h});
}