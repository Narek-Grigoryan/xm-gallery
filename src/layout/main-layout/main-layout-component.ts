import {ChangeDetectionStrategy, Component} from "@angular/core";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatButton} from "@angular/material/button";


@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout-component.html',
  styleUrls: ['./main-layout-component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    MatButton,
    RouterLinkActive,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {

}
