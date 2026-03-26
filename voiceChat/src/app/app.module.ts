import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';

import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatCardModule } from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './components/groups/groups.component';
import { GroupUsersComponent } from './components/group-users/group-users.component';
import { HomeComponent } from './home/home.component';
import { CreateGroupComponent } from './components/create-group/create-group.component';
import { MatDialogModule } from '@angular/material/dialog';
import { JoinGroupComponent } from './components/join-group/join-group.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatMenuModule} from '@angular/material/menu';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { SplitterModule } from 'primeng/splitter';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SettingsComponent } from './settings/settings.component';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { Avatar } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    RegisterComponent,
    LoginComponent,
    GroupsComponent,
    GroupUsersComponent,
    HomeComponent,
    CreateGroupComponent,
    JoinGroupComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatStepperModule,
    MatMenuModule,
    SplitterModule,
    ScrollPanelModule,
    ContextMenuModule,
    ConfirmDialogModule,
    MenuModule,
    FileUploadModule,
    ButtonModule,
    SplitterModule,
    InputTextModule,
    PopoverModule,
    Avatar,
    DrawerModule
],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({ 
            theme: {
                preset: Aura
            }
        })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
