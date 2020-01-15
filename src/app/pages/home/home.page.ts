import { Storage } from '@ionic/storage';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { File, IWriteOptions } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
 // Canvas stuff
 @ViewChild('imageCanvas',{static:true}) canvas: any;
 canvasElement: any;

 saveX: number;
 saveY: number;

 storedImages = [];

 // Make Canvas sticky at the top stuff
 @ViewChild('fixedContainer',{static:true}) fixedContainer: any;

 // Color Stuff
 selectedColor = '#9e2956';

 colors = [ '#9e2956', '#c2281d', '#de722f', '#edbf4c', '#5db37e', '#459cde', '#4250ad', '#802fa3' ];
  constructor(private storage:Storage,
    private platform:Platform,
    private file:File) {}

  ngOnInit() {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.platform.width() + '';
    this.canvasElement.height = 200;
    console.log(this.canvasElement)
  }
  selectColor(color){
    this.selectedColor = color;
  }
  startDrawing(env){
    let canvasPosition = this.canvasElement.getBoundingClientRect();
    this.saveX = env.touches[0].pageX - canvasPosition.x;
    this.saveY = env.touches[0].pageY - canvasPosition.y
  }
  moved(env){
    let canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');
    let currentY = env.touches[0].pageY - canvasPosition.y;
    let currentX = env.touches[0].pageX - canvasPosition.x;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(this.saveX,this.saveY);
    ctx.lineTo(currentX,currentY);
    ctx.closePath();

    ctx.stroke();
    this.saveX = currentX;
    this.saveY = currentY;

  }  
  clearCanvas(){
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  savedCanvas(){
    let dataUrl = this.canvasElement.toDataURL();
    
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    let name = new Date().getTime() + '.png';
    let path = this.file.dataDirectory;
    let options:IWriteOptions = {replace:true};

    let data = dataUrl.spli(',')[1];
    let blob = this.b64toBlob(data, 'image/png');
    this.file.writeFile(path,name,blob,options).then((res)=>{
      this.storeImage(name)
    },err =>{
      console.log(err);
    })

  }
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
   
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
   
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
   
      var byteArray = new Uint8Array(byteNumbers);
   
      byteArrays.push(byteArray);
    }
   
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  storeImage(imageName) {
    let saveObj = { img: imageName };
    this.storedImages.push(saveObj);
    this.storage.set('imagenes', this.storedImages);
  }
}
