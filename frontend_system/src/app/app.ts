import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Project {
  projectName: string;
  project_status: string;
  approvedremark: string;
  selectable: boolean; //permission was done, cant proceed 
  selected?: boolean;
}

@Component({
  selector: 'app-root',
   standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  
  projects: Project[] = [];
  loading =false;
modalTitle = '';
modalBtnTxt ='';
status = '';
  showApproveModal = false;
  approveRemark = '';
  selectedProjects: Project[] = [];
  private apiUrl = 'https://localhost:7070/api/projects';

  constructor(private http: HttpClient) {
    this.loadProjects();
  }
  loadProjects() {
    this.loading = true;

    this.http.get<Project[]>(this.apiUrl)
      .subscribe({
        next: data => {
          this.projects = data.map(p => ({
    ...p,
    selected: false
  }));
          this.loading = false;
            
        },
        error: err => {
          console.error('API error', err);
          this.loading = false;
        }
      });
  } 
  
  approve() {
    const selected = this.projects.filter(p => p.selected==true && p.selectable==false);

    if (selected.length === 0) {
      alert('กรุณาเลือกรายการ');
      return;
    }
 this.selectedProjects = selected;
    this.approveRemark = '';
    this.showApproveModal = true;
      this.modalTitle = 'ยืนยันการอนุมัติ';
      this.modalBtnTxt = 'อนุมัติ';
    this.status='อนุมัติ';
  }
  confirmApprove() {
  const payload = this.selectedProjects.map(p => ({
    projectName: p.projectName,
    remark: this.approveRemark
  }));

  this.http.post(`${this.apiUrl}/approve`, payload)
    .subscribe({
      next: () => {
        for (const project of this.selectedProjects) {
          project.approvedremark = this.approveRemark;
          project.project_status = this.status;
          project.selectable = true; // disable checkbox
          project.selected = false;
        }

        console.log('Approved:', payload);
        this.showApproveModal = false;
      },
      error: err => {
        console.error('Backend error', err);
        alert('ไม่สามารถบันทึกข้อมูลได้');
      }
    });
}

/*confirmApprove() {  
  for (const project of this.selectedProjects) {
    project.approvedremark = this.approveRemark;
  project.selectable = true; // disable checkbox
    project.selected = false; 
  }
    console.log('Approved projects:', this.selectedProjects);
    console.log('Remark:', this.approveRemark);
   
   

    this.showApproveModal = false;
  }*/

  cancelApprove() {
    this.showApproveModal = false;
  }
  
  reject() {
    const selected = this.projects.filter(p => p.selected==true && p.selectable==false);

    if (selected.length === 0) {
      alert('Please select at least one project');
      return;
    }
 this.selectedProjects = selected;
    this.approveRemark = '';
    this.showApproveModal = true;
      this.modalTitle = 'ยืนยันการไม่อนุมัติ';
         this.modalBtnTxt = 'ไม่อนุมัติ';
            this.status='อนุมัติ';
  }

  
  
}