import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription, from, of, switchMap, take } from 'rxjs';
import { FileTypeResult } from 'file-type';
import { fromBuffer } from 'file-type/core';
import { Role } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BannerColorService } from '../../services/banner-color.service';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  form: FormGroup | undefined;

  validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
  validMimeTypes: ValidMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];

  userFullImagePath: string | undefined;
  private userSubscription: Subscription | undefined;
  private userImagePathSubscription: Subscription | undefined;

  fullName$ = new BehaviorSubject<string | undefined>(undefined);
  fullName = '';

  constructor(
    private authService: AuthService,
    public bannerColorService: BannerColorService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      File: new FormControl(undefined),
    });

    this.authService.userFullName
      .pipe(take(1))
      .subscribe((fullName: string | undefined) => {
        if (fullName) {
          this.fullName = fullName;
          this.fullName$.next(fullName);
        }
      });

    this.userImagePathSubscription =
      this.authService.userFullImagePath.subscribe(
        (fullImagePath: string | undefined) => {
          this.userFullImagePath = fullImagePath;
        }
      );

    this.authService.userRole
      .pipe(take(1))
      .subscribe((role: Role | undefined) => {
        if (role) {
          this.bannerColorService.bannerColors =
            this.bannerColorService.getBannerColors(role);
        }
      });
  }

  onFileSelect(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement || !inputElement.files) return;

    const file: File = inputElement.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    from(file.arrayBuffer())
      .pipe(
        switchMap((buffer: ArrayBuffer) => {
          return from(fromBuffer(Buffer.from(buffer))).pipe(
            switchMap((fileTypeResult: FileTypeResult | undefined) => {
              if (!fileTypeResult) {
                // TODO: error handling
                console.log({ error: 'File format not supported!' });
                return of();
              }
              const { ext, mime } = fileTypeResult;
              const isFileTypeLegit = this.validFileExtensions.includes(
                ext as any
              );
              const isMimeTypeLegit = this.validMimeTypes.includes(mime as any);
              const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
              if (!isFileLegit) {
                // TODO: error handling
                console.log({
                  error: 'File format does not match file extension!',
                });
                return of();
              }
              return this.authService.uploadUserImage(formData);
            })
          );
        })
      )
      .subscribe();

    this.form?.reset();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.userImagePathSubscription?.unsubscribe();
  }
}
