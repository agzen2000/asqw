AFRAME.registerComponent('grab-ball', {
    schema: {hand: {type: 'string', default: 'right'}},
    init: function() {
        let el = this.el;
        el.velocities = [5]
        el.angularV = [5]
        el.previousPosition = undefined
        el.previousRotation = undefined
        el.next = 0
      
        this.gripDown = function(e) {
          let hand = document.getElementById(el.id).childNodes[0]
          console.log(el.childNodes[1])
          let ball = document.getElementById('ball')
          
          var handPos = new THREE.Vector3();
          hand.object3D.getWorldPosition(handPos)
          
          var ballPos = new THREE.Vector3();
          ball.object3D.getWorldPosition(ballPos)
          
          if (handPos.distanceTo(ballPos) < 9999) {
            el.grabbed = ball       
            ball.setAttribute('color', 'red')
            ball.setAttribute('body', {type: "static"})
          }
        }
      
      this.gripUp = function(e) {
          if (el.grabbed != undefined) {
            el.grabbed.setAttribute('color', 'white')
            el.grabbed.setAttribute('body', {type: "dynamic"})
            
            let averageV = new THREE.Vector3();
            let averageW = new THREE.Vector3();
            let weights = [2.0, 2.0, 1.0, 0.5, 0.5]
            let totalV = 0
            let totalW = 0
            let current = el.next - 1;
            for (let i = 0; i < 5; i++) {
              if (current == -1) {
                current = 4;
              }
              if (el.velocities[current] != undefined && el.angularV[current] != undefined) {
                let temp1 = new THREE.Vector3()
                temp1 = el.velocities[current].clone()
                if(temp1.length() > 0.1) {
                  temp1.multiplyScalar(weights[i])
                  averageV.add(temp1)
                  totalV += weights[i]
                }
                
                let temp2 = new THREE.Vector3()
                temp2 = el.angularV[current].clone()
                if(temp2.length() > 0.1) {
                  temp2.multiplyScalar(weights[i])
                  averageW.add(temp2)
                  totalW += weights[i]
                }
              }
              current = current - 1;
            }
            
            if (totalV == 0) {
              totalV = 1;
            }
            
            if (totalW == 0) {
              totalW = 1;
            }
            
            averageV.divideScalar(totalV)
            averageW.divideScalar(totalW)
            
            if (averageV.length() > 2) {
              averageV.multiplyScalar(2)
            }
            
            console.log(el.velocities)
            console.log(el.next - 1)
            console.log(totalV)
            console.log(averageV)
            console.log(averageW)

            el.grabbed.body.angularVelocity.set(averageW.x, averageW.y, averageW.z)
            el.grabbed.body.velocity.set(averageV.x, averageV.y, averageV.z)
            el.grabbed.body.vlambda.set(0,0,0);
            el.grabbed.body.wlambda.set(0,0,0);
            
            el.grabbed = null
            
          }
        }
      
      this.triggerDown = function(e) {
        let hand = document.getElementById('centerOfMass')
        var handPos = new THREE.Vector3();
        hand.object3D.getWorldPosition(handPos)
        
        let newMark = document.createElement('a-sphere');
        newMark.setAttribute('position', handPos);
        newMark.setAttribute('radius', '0.01');
        
        let scene = document.querySelector('a-scene');
        scene.appendChild(newMark);
      }
      
        this.el.addEventListener('gripdown', this.gripDown)
        this.el.addEventListener('triggerdown', this.triggerDown)
        this.el.addEventListener('gripup', this.gripUp)
    },
    tick: function(time, timeDelta) {
      let el = this.el;
      
      if (el.grabbed != undefined && el.grabbed != null) {
        
        el.grabbed.setAttribute('color', 'red')
        
        let hand = document.getElementById('centerOfMass')
        var handPos = new THREE.Vector3();
        hand.object3D.getWorldPosition(handPos)
        
        el.grabbed.body.position.set(handPos.x, handPos.y, handPos.z)
        
        if (el.previousPosition == undefined) {
          el.previousPosition = handPos.clone()
        }
        handPos.sub(el.previousPosition).divideScalar(timeDelta / 1000.0)
        el.velocities[el.next] = handPos.clone()
        
        var handRot = new THREE.Vector3();
        hand.object3D.getWorldDirection(handRot)
        if (el.previousRotation == undefined) {
          el.previousRotation = handRot.clone()
        }
        handRot.sub(el.previousRotation).divideScalar(timeDelta / 1000.0)
        el.angularV[el.next] = handRot.clone()    
        
        if (++el.next > 5)
          el.next = 0
        
        hand.object3D.getWorldPosition(handPos)
        hand.object3D.getWorldDirection(handRot)
        el.previousPosition = handPos.clone()
        el.previousRotation = handRot.clone()
        
      }        
          
    },
    remove: function() {
      this.el.removeEventListener('gripdown', this.gripDown)
      this.el.removeEventListener('gripup', this.gripUp)
    }
})