import {ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {DatePipe} from '@angular/common';
import {GeminiService} from './gemini.service';
import {auth, db, googleProvider} from './firebase';
import {signInWithPopup, onAuthStateChanged, User} from 'firebase/auth';
import {doc, getDoc, setDoc, collection, onSnapshot, addDoc, deleteDoc} from 'firebase/firestore';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  rating?: 'up' | 'down';
  feedbackSubmitted?: boolean;
  showFeedbackForm?: boolean;
}

interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  instructions?: string;
  createdAt: number;
  authorUid: string;
}

enum UserRole {
  ADMIN = 'admin',
  CATECHIST = 'Catechist',
  SPONSOR = 'Sponsor',
  CANDIDATE = 'Candidate',
  GENERAL = 'General',
  OCIA_LEADER = 'OCIA leader',
  PRIEST = 'Priest',
  DEACON = 'Deacon'
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    FormsModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatInputModule, 
    MatCardModule,
    DatePipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewChecked {
  private gemini = inject(GeminiService);
  
  // State
  view = signal<'chat' | 'kb'>('chat');
  messages = signal<ChatMessage[]>([]);
  prompt = signal('');
  loading = signal(false);
  isListening = signal(false);
  private recognition: SpeechRecognition | null = null;
  user = signal<User | null>(null);
  isAdmin = signal<boolean>(false);
  profileCompleted = signal<boolean>(false);
  userRole = signal<UserRole>(UserRole.GENERAL);
  selectedPeriod = signal<string>('General');
  languagePreference = signal<string>('English');
  useDeepThink = signal<boolean>(false);
  OCIA_PERIODS = ['Inquiry', 'Catechumenate', 'Purification & Enlightenment', 'Mystagogy', 'General'];
  
  // Profile Form State
  firstName = signal('');
  lastName = signal('');
  parishName = signal('');
  email = signal('');
  phone = signal('');
  selectedDiocese = signal('');
  otherDiocese = signal('');
  selectedRole = signal<UserRole>(UserRole.GENERAL);
  profileLoading = signal(false);

  roles = [
    { value: UserRole.CANDIDATE, label: 'Candidate / Inquirer' },
    { value: UserRole.SPONSOR, label: 'Sponsor' },
    { value: UserRole.CATECHIST, label: 'Catechist' },
    { value: UserRole.OCIA_LEADER, label: 'OCIA Leader (Director/Coordinator)' },
    { value: UserRole.PRIEST, label: 'Priest' },
    { value: UserRole.DEACON, label: 'Deacon' },
    { value: UserRole.GENERAL, label: 'General Interest' }
  ];

  getGreetingForRole(role: UserRole): string {
    switch (role) {
      case UserRole.CANDIDATE:
        return "Hi, I'm Cyril. I'm here to support you as you explore the Catholic faith. Whether you're curious about Jesus, have questions about the Mass, or want to know what to expect in the OCIA journey, just ask!";
      case UserRole.SPONSOR:
        return "Hi, I'm Cyril! Thank you for stepping up to be a sponsor. I'm here to help you understand your role, guide you on how to share your faith, and explain the rites you'll be participating in. What would you like to know first?";
      case UserRole.CATECHIST:
        return "Hello! As a fellow catechist, I'm here to help you prepare engaging sessions, understand the OCIA periods, and break open the Word. How can I assist with your lesson planning today?";
      case UserRole.OCIA_LEADER:
        return "Hello! I'm here to assist you with the administration, canonical questions, team formation, and liturgical planning of the OCIA. How can I support your ministry today?";
      case UserRole.PRIEST:
        return "Greetings, Father. I'm here to assist with liturgical rubrics, canonical questions regarding faculties and valid baptisms, and homiletic connections for the rites. How can I serve you today?";
      case UserRole.DEACON:
        return "Greetings, Deacon. I'm ready to assist with your liturgical roles in the rites, instructions, dismissals, and linking candidates to the parish's charitable works. How can I help?";
      default:
        return "Hi, I'm Cyril. I'm an AI assistant designed to help you navigate the Order of Christian Initiation of Adults (OCIA). How can I help you today?";
    }
  }

  setInitialGreeting(role: UserRole) {
    if (this.messages().length === 0) {
      this.messages.set([{id: Date.now().toString(), role: 'bot', text: this.getGreetingForRole(role)}]);
    } else if (this.messages().length === 1 && this.messages()[0].role === 'bot') {
       this.messages.set([{id: this.messages()[0].id, role: 'bot', text: this.getGreetingForRole(role), rating: this.messages()[0].rating, feedbackSubmitted: this.messages()[0].feedbackSubmitted}]);
    }
  }

  dioceses = [
    "Albany", "Alexandria", "Allentown", "Altoona-Johnstown", "Amarillo", "Anchorage-Juneau", "Arlington", "Atlanta", "Austin", "Baker", "Baltimore", "Baton Rouge", "Beaumont", "Belleville", "Biloxi", "Birmingham", "Bismarck", "Boise", "Boston", "Bridgeport", "Brooklyn", "Brownsville", "Buffalo", "Burlington", "Camden", "Charleston", "Charlotte", "Cheyenne", "Chicago", "Cincinnati", "Cleveland", "Colorado Springs", "Columbus", "Corpus Christi", "Covington", "Crookston", "Dallas", "Davenport", "Denver", "Des Moines", "Detroit", "Dodge City", "Dubuque", "Duluth", "El Paso", "Erie", "Evansville", "Fairbanks", "Fall River", "Fargo", "Fort Wayne-South Bend", "Fort Worth", "Fresno", "Gallup", "Galveston-Houston", "Gary", "Gaylord", "Grand Island", "Grand Rapids", "Great Falls-Billings", "Green Bay", "Greensburg", "Harrisburg", "Hartford", "Helena", "Honolulu", "Houma-Thibodaux", "Indianapolis", "Jackson", "Jefferson City", "Joliet", "Kalamazoo", "Kansas City in Kansas", "Kansas City-St. Joseph", "Knoxville", "La Crosse", "Lafayette", "Lafayette in Indiana", "Lake Charles", "Lansing", "Laredo", "Las Cruces", "Las Vegas", "Lexington", "Lincoln", "Little Rock", "Los Angeles", "Louisville", "Lubbock", "Madison", "Manchester", "Marquette", "Memphis", "Metuchen", "Miami", "Military Archdiocese", "Milwaukee", "Mobile", "Monterey", "Nashville", "New Orleans", "New Ulm", "New York", "Newark", "Norwich", "Oakland", "Ogdensburg", "Oklahoma City", "Omaha", "Orange", "Orlando", "Owensboro", "Palm Beach", "Passaic", "Paterson", "Pensacola-Tallahassee", "Peoria", "Philadelphia", "Phoenix", "Pittsburgh", "Portland", "Providence", "Pueblo", "Raleigh", "Rapid City", "Reno", "Richmond", "Rochester", "Rockford", "Rockville Centre", "Sacramento", "Saginaw", "Salina", "Salt Lake City", "San Angelo", "San Antonio", "San Bernardino", "San Diego", "San Francisco", "San Jose", "Santa Fe", "Santa Rosa", "Savannah", "Scranton", "Seattle", "Shreveport", "Sioux City", "Sioux Falls", "Spokane", "Springfield", "Springfield in Illinois", "Springfield-Cape Girardeau", "St. Augustine", "St. Cloud", "St. Petersburg", "Steubenville", "Stockton", "Superior", "Syracuse", "Toledo", "Trenton", "Tucson", "Tulsa", "Tyler", "Venice", "Victoria", "Washington", "Wheeling-Charleston", "Wichita", "Wilmington", "Winona-Rochester", "Worcester", "Yakima", "Youngstown", "Other"
  ];

  // Knowledge Base State
  kbDocs = signal<KnowledgeDoc[]>([]);
  kbSearchQuery = signal('');
  filteredKbDocs = computed(() => {
    const query = this.kbSearchQuery().toLowerCase();
    if (!query) return this.kbDocs();
    return this.kbDocs().filter(doc => 
      doc.title.toLowerCase().includes(query) || 
      doc.content.toLowerCase().includes(query)
    );
  });
  newDocTitle = signal('');
  newDocContent = signal('');
  newDocInstructions = signal('');
  kbLoading = signal(false);

  currentYear = new Date().getFullYear();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngOnInit() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        this.prompt.set(transcript);
        this.isListening.set(false);
        this.sendMessage();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        this.isListening.set(false);
      };
      this.recognition = recognition;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user && !['schoedelb@gmail.com', 'barry@schoedel.design'].includes(user.email || '')) {
        await auth.signOut();
        alert('Access Restricted. For a demo, please contact barry@schoedel.design.');
        this.user.set(null);
        return;
      }
      
      this.user.set(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let role = UserRole.GENERAL;
        let isProfileCompleted = false;
        
        if (userDoc.exists()) {
          role = (userDoc.data()['role'] as UserRole) || UserRole.GENERAL;
          isProfileCompleted = userDoc.data()['profileCompleted'] === true;
          
          if (isProfileCompleted) {
            this.firstName.set(userDoc.data()['firstName'] || '');
            this.lastName.set(userDoc.data()['lastName'] || '');
            this.parishName.set(userDoc.data()['parishName'] || '');
            this.selectedDiocese.set(userDoc.data()['diocese'] || '');
            this.otherDiocese.set(userDoc.data()['otherDiocese'] || '');
            this.selectedRole.set(role);
          }
        } else {
          // Check if default admin
          if (user.email === 'schoedelb@gmail.com' && user.emailVerified) {
            role = UserRole.ADMIN;
          }
          await setDoc(userDocRef, {uid: user.uid, email: user.email, role, profileCompleted: false});
        }
        
        this.profileCompleted.set(isProfileCompleted);
        this.isAdmin.set(role === UserRole.ADMIN || (user.email === 'schoedelb@gmail.com' && user.emailVerified));
        this.userRole.set(role);
        this.selectedRole.set(role);
        this.gemini.setUserRole(role);
        this.email.set(user.email || '');
        
        if (isProfileCompleted) {
          this.setInitialGreeting(role);
        }
        
        // Listen to Knowledge Base documents
        onSnapshot(collection(db, 'knowledge_base'), (snapshot) => {
          const docs: KnowledgeDoc[] = [];
          snapshot.forEach((docSnap) => {
            docs.push({ id: docSnap.id, ...docSnap.data() } as KnowledgeDoc);
          });
          // Sort by newest first
          docs.sort((a, b) => b.createdAt - a.createdAt);
          this.kbDocs.set(docs);
          
          // Update Gemini Service
          this.gemini.setKnowledgeBase(docs.map(d => ({ title: d.title, content: d.content, instructions: d.instructions })));
        }, (error) => {
          console.error('Error fetching knowledge base:', error);
        });

        // Load Memory
        const memoryDocRef = doc(db, 'users', user.uid, 'memory', 'current');
        const memoryDoc = await getDoc(memoryDocRef);
        if (memoryDoc.exists()) {
          const notes = memoryDoc.data()['notes'] || '';
          this.gemini.setUserMemory(notes);
        }

        // Ask for language preference if not set
        if (!userDoc.data()?.['languagePreference']) {
          const lang = prompt("What language do you prefer? (English/Spanish)", "English");
          if (lang) {
            this.languagePreference.set(lang);
            this.gemini.setLanguage(lang);
            await setDoc(userDocRef, {languagePreference: lang}, { merge: true });
          }
        } else {
          this.languagePreference.set(userDoc.data()?.['languagePreference']);
          this.gemini.setLanguage(userDoc.data()?.['languagePreference']);
        }
      }
    });
  }

  ngAfterViewChecked() {
    if (this.view() === 'chat') {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {
      // Ignore scroll errors
    }
  }

  async signIn() {
    await signInWithPopup(auth, googleProvider);
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.sendMessage();
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async sendMessage() {
    if (!this.prompt().trim() || !this.user()) return;
    const userMessage = this.prompt().trim();
    
    // Add memory detection
    if (userMessage.toLowerCase().startsWith('cyril, remember')) {
      const memoryToSave = userMessage.substring('cyril, remember'.length).trim();
      if (memoryToSave) {
        await this.addNewMemory(memoryToSave);
        this.prompt.set('');
        this.messages.update(m => [...m, {id: Date.now().toString(), role: 'user', text: userMessage}]);
        this.messages.update(m => [...m, {id: Date.now().toString(), role: 'bot', text: 'Got it! I will remember that.'}]);
        return;
      }
    }
    
    this.prompt.set('');
    
    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    const newMessage: ChatMessage = {id: Date.now().toString(), role: 'user', text: userMessage};
    this.messages.update(m => [...m, newMessage]);
    this.loading.set(true);
    
    try {
      this.gemini.setSelectedPeriod(this.selectedPeriod());
      const response = await this.gemini.chat(userMessage, this.useDeepThink());
      const botMessage: ChatMessage = {id: Date.now().toString(), role: 'bot', text: response.text || ''};
      this.messages.update(m => [...m, botMessage]);
      await this.saveChatSession([newMessage, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      this.messages.update(m => [...m, {id: Date.now().toString(), role: 'bot', text: 'Sorry, I encountered an error processing your request.'}]);
    } finally {
      this.loading.set(false);
    }
  }

  async saveChatSession(newMessages: ChatMessage[]) {
    if (!this.user()) return;
    const chatRef = doc(collection(db, 'users', this.user()!.uid, 'chats'));
    await setDoc(chatRef, {
      userId: this.user()!.uid,
      title: newMessages[0].text.substring(0, 50),
      createdAt: Date.now(),
      messages: this.messages() // Save full chat history
    });
  }

  exportChat() {
    if (this.messages().length === 0) return;
    let text = 'Chat Export - Cyril Assistant\n';
    text += `Date: ${new Date().toLocaleString()}\n\n`;
    this.messages().forEach(msg => {
      text += `${msg.role.toUpperCase()}: ${msg.text}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyril-chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async addNewMemory(newNote: string) {
    if (!this.user()) return;
    const memoryDocRef = doc(db, 'users', this.user()!.uid, 'memory', 'current');
    const memoryDoc = await getDoc(memoryDocRef);
    let currentNotes = '';
    if (memoryDoc.exists()) {
      currentNotes = memoryDoc.data()['notes'] || '';
    }
    const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    await setDoc(memoryDocRef, {
      userId: this.user()!.uid,
      notes: updatedNotes,
      updatedAt: Date.now()
    });
    this.gemini.setUserMemory(updatedNotes);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.user()) return;
    
    this.messages.update(m => [...m, {id: Date.now().toString(), role: 'user', text: `[Uploaded Image: ${file.name}]`}]);
    this.loading.set(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const mimeType = file.type || 'image/jpeg';
        const response = await this.gemini.analyzeImage('Analyze this image in the context of OCIA.', base64, mimeType);
        this.messages.update(m => [...m, {id: Date.now().toString(), role: 'bot', text: response.text || ''}]);
      } catch (error) {
        console.error("Error analyzing image:", error);
        this.messages.update(m => [...m, {id: Date.now().toString(), role: 'bot', text: 'Sorry, I encountered an error analyzing the image.'}]);
      } finally {
        this.loading.set(false);
        // Reset input so the same file can be selected again
        input.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  async submitProfile() {
    if (!this.user()) return;
    if (!this.firstName().trim() || !this.lastName().trim() || !this.parishName().trim() || !this.email().trim() || !this.selectedDiocese()) {
      alert("Please fill out all required fields.");
      return;
    }
    if (this.selectedDiocese() === 'Other' && !this.otherDiocese().trim()) {
      alert("Please specify your diocese.");
      return;
    }

    this.profileLoading.set(true);
    try {
      const profileData = {
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        parishName: this.parishName().trim(),
        email: this.email().trim(),
        phone: this.phone().trim(),
        diocese: this.selectedDiocese(),
        otherDiocese: this.selectedDiocese() === 'Other' ? this.otherDiocese().trim() : '',
        role: this.selectedRole(),
        profileCompleted: true
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', this.user()!.uid), profileData, { merge: true });
      
      this.userRole.set(this.selectedRole());
      this.gemini.setUserRole(this.selectedRole());
      const isDevAdmin = this.user()?.email === 'schoedelb@gmail.com' && this.user()?.emailVerified === true;
      this.isAdmin.set(this.selectedRole() === UserRole.ADMIN || isDevAdmin);
      this.setInitialGreeting(this.selectedRole());

      // Send email via backend
      try {
        await fetch('/api/send-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
      } catch (emailError) {
        console.error("Error sending profile email:", emailError);
        // We don't block the user if the email fails, they still completed the profile
      }

      this.profileCompleted.set(true);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      this.profileLoading.set(false);
    }
  }

  async playSpeech(text: string) {
    try {
      const response = await this.gemini.generateSpeech(text);
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audio.play();
      }
    } catch (error) {
      console.error("Error generating speech:", error);
    }
  }

  rateMessage(msgId: string, rating: 'up' | 'down') {
    this.messages.update(msgs => msgs.map(m => m.id === msgId ? {...m, rating, showFeedbackForm: true} : m));
  }

  async submitFeedback(msgId: string, comment: string) {
    const msgs = this.messages();
    const msgIndex = msgs.findIndex(m => m.id === msgId);
    if (msgIndex === -1 || !this.user()) return;
    
    const msg = msgs[msgIndex];
    
    let promptText = '';
    if (msgIndex > 0 && msgs[msgIndex - 1].role === 'user') {
      promptText = msgs[msgIndex - 1].text;
    }

    try {
      const feedbackData: Record<string, unknown> = {
        userId: this.user()!.uid,
        userEmail: this.user()!.email || '',
        prompt: promptText,
        response: msg.text,
        createdAt: Date.now()
      };
      if (msg.rating) feedbackData['rating'] = msg.rating;
      if (comment) feedbackData['comment'] = comment;

      await addDoc(collection(db, 'feedback'), feedbackData);
      
      this.messages.update(m => m.map(item => item.id === msgId ? {...item, feedbackSubmitted: true, showFeedbackForm: false} : item));
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  }

  cancelFeedback(msgId: string) {
    this.messages.update(msgs => msgs.map(m => m.id === msgId ? {...m, showFeedbackForm: false, rating: undefined} : m));
  }

  toggleVoiceMode() {
    if (this.isListening()) {
      this.recognition?.stop();
      this.isListening.set(false);
    } else {
      this.recognition?.start();
      this.isListening.set(true);
    }
  }

  // Knowledge Base Methods
  async onKbFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Check file size (limit to ~900KB to stay under Firestore 1MB limit)
    if (file.size > 900000) {
      alert("File is too large. Please upload a file smaller than 900KB.");
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Remove file extension for the title
      const title = file.name.replace(/\.[^/.]+$/, "");
      this.newDocTitle.set(title);
      this.newDocContent.set(text);
      input.value = ''; // Reset input
    };
    reader.readAsText(file);
  }

  async addKnowledgeDoc() {
    if (!this.newDocTitle().trim() || !this.newDocContent().trim() || !this.user() || !this.isAdmin()) return;
    
    this.kbLoading.set(true);
    try {
      const docData: Omit<KnowledgeDoc, 'id'> = {
        title: this.newDocTitle().trim(),
        content: this.newDocContent().trim(),
        createdAt: Date.now(),
        authorUid: this.user()!.uid
      };
      
      const instructions = this.newDocInstructions().trim();
      if (instructions) {
        docData.instructions = instructions;
      }

      await addDoc(collection(db, 'knowledge_base'), docData);
      this.newDocTitle.set('');
      this.newDocContent.set('');
      this.newDocInstructions.set('');
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add document. Ensure you have admin privileges.");
    } finally {
      this.kbLoading.set(false);
    }
  }

  async deleteKnowledgeDoc(docId: string) {
    if (!this.user() || !this.isAdmin()) return;
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDoc(doc(db, 'knowledge_base', docId));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document.");
      }
    }
  }
}
