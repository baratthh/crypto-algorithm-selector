import json
import shutil 
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

def main():
    """
    Main build script to generate the static website.
    Copies JSON data files instead of embedding them.
    """
    print("Starting static site build...")

    # Define paths
    script_location = Path(__file__).resolve()
    project_root = Path(__file__).parent
    knowledge_base_dir = project_root / "knowledge_base"
    template_dir = project_root / "templates"
    static_source_dir = project_root / "static"
    output_dir = project_root / "dist"
    static_dest_dir = output_dir / "static"
    data_dest_dir = static_dest_dir / "data" 

    # Clean and create output directories
    if output_dir.exists():
        shutil.rmtree(output_dir)
        print(f"Cleaned output directory: {output_dir}")
    output_dir.mkdir(exist_ok=True)
    static_dest_dir.mkdir(exist_ok=True)
    data_dest_dir.mkdir(exist_ok=True) 
    print(f"Created output directories.")

    # Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("index.html")

    # Render the main HTML file 
    rendered_html = template.render() 

    # Write the rendered HTML to the output directory
    try:
        (output_dir / "index.html").write_text(rendered_html, encoding="utf-8")
        print("Rendered index.html")
    except Exception as e:
        print(f"Error writing index.html: {e}")
        return # Stop build if HTML fails

    # --- Copy Static Files (CSS, JS, favicon) ---
    print("Copying static assets...")
    try:
        for item in static_source_dir.iterdir():
            if item.is_file():
                dest_file = static_dest_dir / item.name
                shutil.copy2(item, dest_file) 
                print(f"  Copied {item.name}")
    except Exception as e:
        print(f"Error copying static files: {e}")
        return # Stop build if static files fail

    # --- Copy Knowledge Base JSON Files ---
    print("Copying knowledge base data...")
    try:
        json_files_to_copy = ["algorithms.json", "compliance_standards.json", "use_cases.json"]
        for filename in json_files_to_copy:
            source_file = knowledge_base_dir / filename
            dest_file = data_dest_dir / filename
            if source_file.exists():
                shutil.copy2(source_file, dest_file)
                print(f"  Copied {filename} to {data_dest_dir.relative_to(project_root)}")
            else:
                print(f"Warning: {filename} not found in knowledge_base directory.")
    except Exception as e:
        print(f"Error copying JSON data files: {e}")
        return # Stop build if data files fail

    print("\nBuild complete. The static site is in the 'dist/' directory.")
    print("You can now serve the 'dist' directory with a simple web server.")
    print("Example: python -m http.server --directory dist")

if __name__ == "__main__":

    main()
