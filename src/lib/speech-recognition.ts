/**
 * Speech Recognition Service for KFM DELICE
 * Supports French language with command parsing for menu items
 */

// Voice command types
export interface VoiceCommand {
  type: 'add' | 'remove' | 'cancel' | 'submit' | 'quantity' | 'search' | 'unknown';
  itemName?: string;
  quantity?: number;
  rawText: string;
  confidence: number;
}

// Speech recognition options
export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

// Menu item for matching
export interface MenuItem {
  id: string;
  name: string;
  aliases?: string[];
  price: number;
  category: string;
}

// French number words mapping
const FRENCH_NUMBERS: Record<string, number> = {
  'un': 1, 'une': 1,
  'deux': 2,
  'trois': 3,
  'quatre': 4,
  'cinq': 5,
  'six': 6,
  'sept': 7,
  'huit': 8,
  'neuf': 9,
  'dix': 10,
  'onze': 11,
  'douze': 12,
  'treize': 13,
  'quatorze': 14,
  'quinze': 15,
  'seize': 16,
  'dix-sept': 17,
  'dix-huit': 18,
  'dix-neuf': 19,
  'vingt': 20,
};

// Command keywords in French
const COMMAND_KEYWORDS = {
  add: ['ajouter', 'ajoute', 'je veux', 'je voudrais', 'donne-moi', 'commander', 'commande', 'prendre', 'mettre'],
  remove: ['supprimer', 'supprime', 'retirer', 'retire', 'enlever', 'enlève', 'annuler', 'annule'],
  cancel: ['tout annuler', 'vider', 'effacer', 'reset', 'recommencer'],
  submit: ['envoyer', 'valider', 'confirmer', 'commander', 'c\'est tout', 'terminé', 'terminer'],
  search: ['rechercher', 'cherche', 'trouver', 'trouve', 'montrer', 'montre'],
  quantity: ['quantité', 'nombre'],
};

/**
 * Check if Speech Recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Get the Speech Recognition constructor
 */
function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionAPI) return null;
  
  return new SpeechRecognitionAPI();
}

/**
 * Parse quantity from text
 */
function parseQuantity(text: string): { quantity: number; textWithoutQuantity: string } {
  let quantity = 1;
  let cleanedText = text.toLowerCase().trim();
  
  // Check for numeric quantity
  const numericMatch = cleanedText.match(/^(\d+)\s+/);
  if (numericMatch) {
    quantity = parseInt(numericMatch[1], 10);
    cleanedText = cleanedText.replace(numericMatch[0], '');
  }
  
  // Check for French number words
  for (const [word, num] of Object.entries(FRENCH_NUMBERS)) {
    const regex = new RegExp(`^${word}\\s+`, 'i');
    if (regex.test(cleanedText)) {
      quantity = num;
      cleanedText = cleanedText.replace(regex, '');
      break;
    }
  }
  
  return { quantity, textWithoutQuantity: cleanedText };
}

/**
 * Find matching menu item from text
 */
function findMenuItem(text: string, menuItems: MenuItem[]): MenuItem | null {
  const lowerText = text.toLowerCase().trim();
  
  // Direct name match
  for (const item of menuItems) {
    if (lowerText.includes(item.name.toLowerCase())) {
      return item;
    }
    
    // Check aliases
    if (item.aliases) {
      for (const alias of item.aliases) {
        if (lowerText.includes(alias.toLowerCase())) {
          return item;
        }
      }
    }
  }
  
  // Fuzzy match - check if text contains significant parts of item name
  const textWords = lowerText.split(/\s+/);
  for (const item of menuItems) {
    const itemWords = item.name.toLowerCase().split(/\s+/);
    const matchCount = itemWords.filter(word => 
      textWords.some(tw => tw.includes(word) || word.includes(tw))
    ).length;
    
    if (matchCount >= Math.ceil(itemWords.length / 2)) {
      return item;
    }
  }
  
  return null;
}

/**
 * Parse voice command from transcript
 */
export function parseVoiceCommand(
  transcript: string, 
  menuItems: MenuItem[],
  confidence: number = 0.9
): VoiceCommand {
  const lowerText = transcript.toLowerCase().trim();
  
  // Check for cancel command
  for (const keyword of COMMAND_KEYWORDS.cancel) {
    if (lowerText.includes(keyword)) {
      return {
        type: 'cancel',
        rawText: transcript,
        confidence,
      };
    }
  }
  
  // Check for submit command
  for (const keyword of COMMAND_KEYWORDS.submit) {
    if (lowerText.includes(keyword)) {
      // Check if it's actually "commander [item]" vs just "commander" (submit)
      const hasItem = findMenuItem(lowerText, menuItems);
      if (!hasItem) {
        return {
          type: 'submit',
          rawText: transcript,
          confidence,
        };
      }
    }
  }
  
  // Check for search command
  for (const keyword of COMMAND_KEYWORDS.search) {
    if (lowerText.includes(keyword)) {
      const searchTerm = lowerText.replace(new RegExp(keyword, 'gi'), '').trim();
      return {
        type: 'search',
        itemName: searchTerm,
        rawText: transcript,
        confidence,
      };
    }
  }
  
  // Check for remove command
  for (const keyword of COMMAND_KEYWORDS.remove) {
    if (lowerText.includes(keyword)) {
      const itemText = lowerText.replace(new RegExp(keyword, 'gi'), '').trim();
      const item = findMenuItem(itemText, menuItems);
      return {
        type: 'remove',
        itemName: item?.name || itemText,
        rawText: transcript,
        confidence,
      };
    }
  }
  
  // Check for add command
  for (const keyword of COMMAND_KEYWORDS.add) {
    if (lowerText.includes(keyword)) {
      const itemText = lowerText.replace(new RegExp(keyword, 'gi'), '').trim();
      const { quantity, textWithoutQuantity } = parseQuantity(itemText);
      const item = findMenuItem(textWithoutQuantity, menuItems);
      
      return {
        type: 'add',
        itemName: item?.name || textWithoutQuantity,
        quantity,
        rawText: transcript,
        confidence,
      };
    }
  }
  
  // Try to parse as simple quantity + item (e.g., "deux attiéké")
  const { quantity, textWithoutQuantity } = parseQuantity(lowerText);
  if (quantity > 1) {
    const item = findMenuItem(textWithoutQuantity, menuItems);
    if (item) {
      return {
        type: 'add',
        itemName: item.name,
        quantity,
        rawText: transcript,
        confidence,
      };
    }
  }
  
  // Default: try to find item and add it
  const item = findMenuItem(lowerText, menuItems);
  if (item) {
    return {
      type: 'add',
      itemName: item.name,
      quantity: 1,
      rawText: transcript,
      confidence,
    };
  }
  
  return {
    type: 'unknown',
    rawText: transcript,
    confidence,
  };
}

/**
 * Speech Recognition Service Class
 */
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private options: SpeechRecognitionOptions;
  
  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      language: 'fr-FR',
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
      ...options,
    };
    
    if (isSpeechRecognitionSupported()) {
      this.recognition = getSpeechRecognition();
      this.setupRecognition();
    }
  }
  
  private setupRecognition(): void {
    if (!this.recognition) return;
    
    this.recognition.lang = this.options.language || 'fr-FR';
    this.recognition.continuous = this.options.continuous || false;
    this.recognition.interimResults = this.options.interimResults || true;
    this.recognition.maxAlternatives = this.options.maxAlternatives || 3;
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript && this.options.onResult) {
        this.options.onResult(finalTranscript, true);
      } else if (interimTranscript && this.options.onResult) {
        this.options.onResult(interimTranscript, false);
      }
    };
    
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = this.getErrorMessage(event.error);
      this.options.onError?.(errorMessage);
      this.isListening = false;
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      this.options.onEnd?.();
    };
    
    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onStart?.();
    };
  }
  
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': 'Aucune parole détectée. Veuillez réessayer.',
      'audio-capture': 'Aucun microphone trouvé. Vérifiez votre microphone.',
      'not-allowed': 'Permission microphone refusée. Veuillez autoriser l\'accès au microphone.',
      'network': 'Erreur réseau. Vérifiez votre connexion internet.',
      'aborted': 'Reconnaissance vocale annulée.',
      'language-not-supported': 'Langue non supportée.',
      'service-not-allowed': 'Service de reconnaissance non autorisé.',
    };
    
    return errorMessages[error] || `Erreur de reconnaissance vocale: ${error}`;
  }
  
  /**
   * Start listening for speech
   */
  start(): boolean {
    if (!this.recognition) {
      this.options.onError?.('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
      return false;
    }
    
    if (this.isListening) {
      return true;
    }
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.options.onError?.('Erreur lors du démarrage de la reconnaissance vocale.');
      return false;
    }
  }
  
  /**
   * Stop listening for speech
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
  
  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }
  
  /**
   * Check if service is supported
   */
  isSupported(): boolean {
    return isSpeechRecognitionSupported();
  }
  
  /**
   * Update options
   */
  updateOptions(options: Partial<SpeechRecognitionOptions>): void {
    this.options = { ...this.options, ...options };
    if (this.recognition) {
      this.recognition.lang = this.options.language || 'fr-FR';
      this.recognition.continuous = this.options.continuous || false;
      this.recognition.interimResults = this.options.interimResults || true;
    }
  }
}

/**
 * Create a speech recognition instance
 */
export function createSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionService {
  return new SpeechRecognitionService(options);
}

/**
 * Default menu items for KFM DELICE
 */
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Attieké Poisson Grillé', aliases: ['attieke', 'poisson', 'attiéké'], price: 15000, category: 'Plats principaux' },
  { id: '2', name: 'Kedjenou de Poulet', aliases: ['kedjenou', 'poulet'], price: 12000, category: 'Plats principaux' },
  { id: '3', name: 'Thiéboudienne', aliases: ['thieb', 'thiébou', 'riz rouge'], price: 10000, category: 'Plats principaux' },
  { id: '4', name: 'Riz Gras', aliases: ['riz'], price: 8000, category: 'Plats principaux' },
  { id: '5', name: 'Garba', aliases: [], price: 5000, category: 'Plats principaux' },
  { id: '6', name: 'Alloco', aliases: ['alloco', 'banane plantain'], price: 5000, category: 'Accompagnements' },
  { id: '7', name: 'Foutou Banane', aliases: ['foutou'], price: 8000, category: 'Plats principaux' },
  { id: '8', name: 'Jus de Bissap', aliases: ['bissap', 'jus'], price: 3000, category: 'Boissons' },
  { id: '9', name: 'Jus de Gingembre', aliases: ['gingembre'], price: 3500, category: 'Boissons' },
  { id: '10', name: 'Eau minérale', aliases: ['eau'], price: 1500, category: 'Boissons' },
  { id: '11', name: 'Frites', aliases: ['pommes frites'], price: 4000, category: 'Accompagnements' },
  { id: '12', name: 'Salade', aliases: [], price: 3000, category: 'Accompagnements' },
];

export default {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  parseVoiceCommand,
  SpeechRecognitionService,
  DEFAULT_MENU_ITEMS,
};
