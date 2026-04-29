// Test imports to debug the module resolution issue
import authService from './lib/services/auth.service';
import { checkSelfExclusion } from './lib/middleware/responsibleGambling';

console.log('authService imported successfully:', typeof authService);
console.log('checkSelfExclusion imported successfully:', typeof checkSelfExclusion);
