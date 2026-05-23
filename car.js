// Represents one car in the simulation. The same class is used for AI-controlled
// cars, player-controlled cars, and dummy traffic cars.
class Car{
    constructor(x,y,width,height,controlType,maxSpeed=3,color="blue"){
        // Position and size of the car's rectangular body before rotation.
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        // Basic physics values used by #move().
        this.speed=0;
        this.acceleration=0.2;
        this.maxSpeed=maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged=false;

        // Only AI cars use the neural network's outputs to control movement.
        this.useBrain=controlType=="AI";

        // DUMMY cars are traffic cars. They move forward but do not need sensors
        // or a neural network.
        if(controlType!="DUMMY"){
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls=new Controls(controlType);

        // Load the car image and recolor it using a canvas mask.
        this.img=new Image();
        this.img.src="car.png"

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            // Fill the mask with the requested car color.
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            // Keep the colored fill only where the car image is opaque.
            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
    }

    update(roadBorders,traffic){
        // Damaged cars stop moving, but their sensors can still be drawn.
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }

        // Sensor readings are converted into neural-network inputs.
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                // Closer obstacles produce larger input values.
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);

            // Output order: forward, left, right, reverse.
            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    #assessDamage(roadBorders,traffic){
        // A car is damaged if its polygon intersects either road border.
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }

        // A car is also damaged if it intersects any traffic car.
        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        // Build a rotated rectangle around the car. Collision detection uses this
        // polygon instead of the unrotated width/height box.
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){
        // Accelerate or reverse based on the current control state.
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        // Clamp forward and reverse speeds. Reverse is intentionally slower.
        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        // Apply friction so the car slows down when no key/output is active.
        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        // Turn only while moving. The flip makes steering behave correctly when
        // reversing.
        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }

        // Convert speed and angle into canvas x/y movement.
        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx,drawSensor=false){
        // Draw sensors before the car so the rays appear behind/under the car.
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }

        // Move the canvas origin to the car and rotate the drawing context.
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);

        // Undamaged cars are drawn with their colored mask. Damaged cars skip the
        // mask, which makes their visual state easier to distinguish.
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();
    }
}
