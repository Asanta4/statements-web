import { Box, Typography, useTheme } from '@mui/material';

interface HilikLogoProps {
  variant?: 'default' | 'small';
}

const HilikLogo = ({ variant = 'default' }: HilikLogoProps) => {
  const theme = useTheme();
  const isSmall = variant === 'small';

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: isSmall ? 0.5 : 1
    }}>
      {/* Logo icon */}
      <Box
        sx={{
          width: isSmall ? 24 : 32,
          height: isSmall ? 24 : 32,
          borderRadius: 1,
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          fontSize: isSmall ? 16 : 20,
        }}
      >
        H
      </Box>
      
      {/* Logo text */}
      <Typography 
        variant={isSmall ? "body1" : "h6"} 
        component="div" 
        sx={{ 
          fontWeight: 'bold',
          letterSpacing: '0.5px',
        }}
      >
        Hilik
      </Typography>
    </Box>
  );
};

export default HilikLogo; 