import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PostService } from '../../services/post.service';
import { IonInfiniteScroll } from '@ionic/angular';
import { Post } from '../../models/Post';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {
  // we are going to loop through(ion-infinite-scroll on html) this elememts to ge the infinite scroll
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll | undefined;

  // @Input() postBody?: string | undefined;

  queryParams: string | undefined;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 20;
  skipPosts = 0;

  constructor(
    private postService: PostService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.dataService
      .getDataObservable()
      .subscribe((postBody: string | undefined) => {
        if (postBody) {
          this.postService.createPost(postBody).subscribe(
            (post: Post) => {
              // unshift here add the post to the start of the array
              this.allLoadedPosts.unshift(post);
            },
            (error) => {
              console.log('Error creating post:', error);
            }
          );
        }
      });
    this.getPosts(false, null);
  }

  // you also can use a setter insead of this
  // changes here is able to tell the current value and the previous value
  // these below detects  the input variable changes
  // ngOnChanges(changes: SimpleChanges) {
  //   const postBody = (changes as any).postBody.currentValue;
  //   // if (!postBody) return;
  //   console.log('postBody:', postBody);
  //   this.postService.createPost(postBody).subscribe(
  //     (post: Post) => {
  //       this.allLoadedPosts.unshift(post);
  //     },
  //     (error) => {
  //       console.log('Error creating post:', error);
  //     }
  //   );
  // }

  getPosts(isInitialLoad: boolean, event: any) {
    if (this.skipPosts === 20) {
      event.target.disabled = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;
    this.postService.getSelectedPosts(this.queryParams).subscribe(
      (posts: Post[]) => {
        for (let post = 0; post < posts.length; post++) {
          this.allLoadedPosts.push(posts[post]);
        }
        if (isInitialLoad) event.target.complete();
        this.skipPosts = this.skipPosts + 20;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadData(event: any) {
    this.getPosts(true, event);
  }
}
