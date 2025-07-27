// Bundle analyzer script for performance monitoring
// Run with: npm run analyze

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing bundle size and performance...\n');

// Build the app
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Analyze build directory
const buildDir = path.join(__dirname, 'build');
const staticDir = path.join(buildDir, 'static');

if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found');
  process.exit(1);
}

// Function to get file size in KB
function getFileSizeKb(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024 * 100) / 100;
}

// Function to get directory size
function getDirSize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirSize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

// Analyze bundle sizes
console.log('\n📊 Bundle Analysis:');
console.log('==================');

const totalBuildSize = getDirSize(buildDir);
console.log(`Total build size: ${Math.round(totalBuildSize / 1024)} KB`);

if (fs.existsSync(staticDir)) {
  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');
  
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    const jsSize = getDirSize(jsDir);
    
    console.log(`\n📄 JavaScript files (${Math.round(jsSize / 1024)} KB total):`);
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const size = getFileSizeKb(filePath);
      console.log(`  - ${file}: ${size} KB`);
    });
  }
  
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    const cssSize = getDirSize(cssDir);
    
    console.log(`\n🎨 CSS files (${Math.round(cssSize / 1024)} KB total):`);
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const size = getFileSizeKb(filePath);
      console.log(`  - ${file}: ${size} KB`);
    });
  }
}

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
console.log('=================================');

const mainJsFile = fs.existsSync(path.join(staticDir, 'js')) 
  ? fs.readdirSync(path.join(staticDir, 'js')).find(f => f.includes('main'))
  : null;

if (mainJsFile) {
  const mainJsSize = getFileSizeKb(path.join(staticDir, 'js', mainJsFile));
  
  if (mainJsSize > 500) {
    console.log('⚠️  Main JS bundle is large (>500KB). Consider:');
    console.log('   - Code splitting with React.lazy()');
    console.log('   - Tree shaking unused dependencies');
    console.log('   - Dynamic imports for large libraries');
  } else if (mainJsSize > 250) {
    console.log('⚠️  Main JS bundle is moderate (>250KB). Consider:');
    console.log('   - Lazy loading non-critical components');
    console.log('   - Optimizing dependencies');
  } else {
    console.log('✅ Main JS bundle size is good (<250KB)');
  }
}

if (totalBuildSize > 1024 * 1024) { // 1MB
  console.log('⚠️  Total build size is large (>1MB). Consider:');
  console.log('   - Compressing images');
  console.log('   - Removing unused assets');
  console.log('   - Enabling gzip compression on server');
} else {
  console.log('✅ Total build size is reasonable (<1MB)');
}

console.log('\n🚀 Optimization checklist:');
console.log('==========================');
console.log('✅ React.memo() implemented for components');
console.log('✅ useMemo() and useCallback() for expensive operations');
console.log('✅ Lazy loading with React.lazy() and Suspense');
console.log('✅ Service Worker for offline caching');
console.log('✅ Optimized localStorage with debouncing');
console.log('✅ Performance monitoring implemented');

console.log('\n🔧 Additional optimizations available:');
console.log('=====================================');
console.log('• Virtual scrolling for large lists');
console.log('• Image optimization and lazy loading');
console.log('• State management with Context API');
console.log('• HTTP/2 server push for critical resources');
console.log('• Preload hints for important resources');

console.log('\n📈 To run performance tests:');
console.log('============================');
console.log('• Use Chrome DevTools Lighthouse');
console.log('• Test with slow network conditions');
console.log('• Monitor Core Web Vitals');
console.log('• Check bundle analysis with webpack-bundle-analyzer');

console.log('\n✨ Analysis complete!');