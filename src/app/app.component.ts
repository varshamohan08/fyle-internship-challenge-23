import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  userForm: FormGroup;
  showCard:Boolean = false;
  blnLoader:Boolean = true
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
  ) {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required]
    });
  }
  userName:any = '';
  userDetails:any
  userRepos:any
  
  currentPage = 1;
  itemsPerPage = 10;

  ngOnInit() {
  }

  getData() {
    this.blnLoader = true
    this.showCard = true;
    return new Promise<void>((resolve, reject) => {
      this.apiService.getUser(this.userName).subscribe((res:any) => {
        
        this.userDetails = res;
        this.apiService.getData(res['repos_url']).subscribe((repos:any) => {
          this.userRepos = repos
          
          const promises = this.userRepos.map((repo: any) => {
            return new Promise<void>((resolveRepo, rejectRepo) => {
              this.apiService.getData(repo.languages_url).subscribe((languages: any) => {
                repo.json_lang = Object.keys(languages);
                resolveRepo();
              }, (error) => {
                rejectRepo(error);
              });
            });
          });
          resolve();
        },
        (error)=>{
          console.log('error');
          this.showCard = false;
          this.userDetails = null;
          this.userRepos = null
          reject(error)
        });
      },
      (error) => {
        console.log('error');
        this.showCard = false;
        this.userDetails = null;
        this.userRepos = null
        reject(error)
      });
    }).then(() => {
      setTimeout(() => {
        // console.log(this.userRepos);
        this.blnLoader = false;
      }, 3000);
    });
  }

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
  }

  getPaginatedRepos() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.userRepos.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil((this.userRepos?.length || 0) / this.itemsPerPage);
  }  
  
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
