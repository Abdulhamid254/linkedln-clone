import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PostService } from '../../services/post.service';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Post } from '../../models/Post';
import { DataService } from '../../services/data.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalComponent } from '../start-post/modal/modal.component';
import { User } from 'src/app/auth/models/user.model';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit, OnDestroy {
  // we are going to loop through(ion-infinite-scroll on html) this elememts to ge the infinite scroll
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll | undefined;

  @Input() postBody?: string | undefined;

  queryParams: string | undefined;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 20;
  skipPosts = 0;

  private userSubscription: Subscription | undefined;

  userId$ = new BehaviorSubject<number | undefined>(undefined);

  constructor(
    public modalController: ModalController,
    private postService: PostService,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.userStream.subscribe(
      (user: User | null) => {
        this.allLoadedPosts.forEach((post: Post, index: number) => {
          if (user?.imagePath && post.author.id === user.id) {
            this.allLoadedPosts[index].fullImagePath =
              this.authService.getFullImagePath(user.imagePath);
          }
        });
      }
    );

    this.dataService
      .getDataObservable()
      .subscribe((postBody: string | undefined) => {
        if (postBody) {
          this.postService.createPost(postBody).subscribe(
            (post: Post) => {
              this.authService.userFullImagePath
                .pipe(take(1))
                .subscribe((fullImagePath: string | undefined) => {
                  if (fullImagePath) {
                    // Check if fullImagePath is defined
                    post.fullImagePath = fullImagePath;
                    this.allLoadedPosts.unshift(post);
                  }
                });
            }
            // (error) => {
            //   console.log('Error creating post:', error);
            // }
          );
        }
      });

    this.getPosts(false, '');

    this.authService.userId
      .pipe(take(1))
      .subscribe((userId: number | undefined) => {
        this.userId$.next(userId);
      });
  }

  // you also can use a setter insead of this
  // changes here is able to tell the current value and the previous value
  // these below detects  the input variable changes
  // ngOnChanges(changes: SimpleChanges) {
  //   const postBody = changes['postBody'].currentValue;
  //   if (!postBody) return;

  //   this.postService.createPost(postBody).subscribe((post: Post) => {
  //     this.authService.userFullImagePath
  //       .pipe(take(1))
  //       .subscribe((fullImagePath: string | undefined) => {
  //         post.fullImagePath? = fullImagePath;
  //         this.allLoadedPosts.unshift(post);
  //       });
  //   });
  // }

  getPosts(isInitialLoad: boolean, event: any) {
    if (this.skipPosts === 20) {
      event.target.disabled = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService
      .getSelectedPosts(this.queryParams)
      .subscribe((posts: Post[]) => {
        for (let postIndex = 0; postIndex < posts.length; postIndex++) {
          const doesAuthorHaveImage = !!posts[postIndex].author.imagePath;
          let fullImagePath = this.authService.getDefaultFullImagePath();
          if (doesAuthorHaveImage) {
            fullImagePath = this.authService.getFullImagePath(
              posts[postIndex].author.imagePath || ''
            );
          }
          posts[postIndex]['fullImagePath'] = fullImagePath;
          this.allLoadedPosts.push(posts[postIndex]);
        }
        if (isInitialLoad) event.target.complete();
        this.skipPosts = this.skipPosts + 5;
      });
  }

  loadData(event: any) {
    this.getPosts(true, event);
  }

  async presentUpdateModal(postId: number) {
    console.log('EDIT POST');

    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
      // passing in some props
      componentProps: {
        postId,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (!data) return;

    const newPostBody = data.post.body;
    this.postService.updatePost(postId, newPostBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex(
        (post: Post) => post.id === postId
      );
      this.allLoadedPosts[postIndex].body = newPostBody;
    });
  }

  deletePost(postId: number) {
    // filtering to check if post.id does not match post id we remove it
    this.postService.deletePost(postId).subscribe(() => {
      this.allLoadedPosts = this.allLoadedPosts.filter(
        (post: Post) => post.id !== postId
      );
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }
}
