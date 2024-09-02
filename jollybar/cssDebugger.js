<script>
    
    GRID.setBreakpoint('desktop', {
        'column-count': 8,
        'column-gutter': '40px',
        'column-margin': '60px',
        'baseline-height': '10px'
    });

    GRID.setBreakpoint('mobile', {
        'column-count': 4,
        'column-gutter': '20px',
        'column-margin': '20px',
        'baseline-height': '10px'
    });

    // Use mobile breakpoint when appropriate
    if (window.innerWidth < 999) {
        GRID.use('mobile');
    }

    // Show the grids when the page loads.
    GRID.columns();
    GRID.baseline();
</script>