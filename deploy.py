"""
This script build BUILDFAST - PWA and upload to main server
"""
import os
import sys
import subprocess


class color:
    """Define class colors"""
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    DARKCYAN = '\033[36m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    SEPARATOR = '======================================='


"""
MAIN DEFINITIONS
"""

environment = sys.argv[1]
# Main angular build script
build_script = ['npm', 'run', 'build:prod']
compress_script = ['zip', '-r', '-q', 'temp.zip', 'dist/iglesiatech2']
upload_command = ['scp', 'temp.zip', 'root@iglesiatech.app:~/temp']
ssh_command = ['ssh', '-t', 'root@iglesiatech.app']
working_dir = os.path.dirname(os.path.realpath(__file__))

"""
PROCESS START
"""
print('{}{}{}Iglesiatech - PWA BUILD SCRIPT V1.0{}'.format(color.UNDERLINE,
                                                      color.BOLD, color.YELLOW, color.END))

print(color.SEPARATOR)
print('{}{}Executing Angular Build{}'.format(
    color.GREEN, color.BOLD, color.END))
print(color.SEPARATOR)

# Call build script
if sys.argv.pop() == '--skip-build':
    print('{}Skipping build{}'.format(color.YELLOW, color.END))
else:
    angular_build = subprocess.run(build_script)
    if angular_build.returncode != 0:
        sys.exit('Angular build failed')

# remove pdftron assets
#subprocess.run(['rm', '-rf', 'dist/samson-pwa/wv-resources/lib'], cwd=working_dir)

# Compress files
print(color.SEPARATOR)
print('{}{}Compressing files{}'.format(color.GREEN, color.BOLD, color.END))
print(color.SEPARATOR)
subprocess.run(['rm', '-rf', 'temp.zip'])
compress_output = subprocess.run(compress_script, cwd=working_dir)

print('{}✔️ Compress success{}'.format(color.GREEN, color.END))

# Upload file
print(color.SEPARATOR)
print('{}{}Uploading to server{}'.format(color.GREEN, color.BOLD, color.END))
print(color.SEPARATOR)

if compress_output.returncode != 0:
    sys.exit('Compress failed')
else:
    # Clean temp folder
    # clean_command = ssh_command
    # clean_command.append('rm -rf ~/temp/*')
    # subprocess.run(clean_command)

    # Print compress success
    upload_output = subprocess.run(upload_command, cwd=working_dir)

    # Set decompress path
    decompress_path = ''
    if environment == '--prod':
        decompress_path = "unzip ~/temp/temp.zip -d ./temp && rm -rf  /var/www/iglesiatechv2.com/html/* && mv ~/temp/dist/iglesiatech2/*  /var/www/iglesiatechv2.com/html/ && rm -rf ~/temp/*"
    elif environment == '--beta':
        decompress_path = "unzip ~/temp/temp.zip -d ./temp && rm -rf  /var/www/iglesiatechv2.com/html/* && mv ~/temp/dist/iglesiatech2* / /var/www/iglesiatechv2.com/html/ && rm -rf ~/temp/*"

    ssh_command.append(decompress_path)

    # Decompress file
    if upload_output.returncode == 0:
        print('{}✔️ Upload success{}'.format(color.GREEN, color.END))

        print(color.SEPARATOR)
        print('{}{}Decompressing files on server{}'.format(
            color.GREEN, color.BOLD, color.END))
        print(color.SEPARATOR)
        deploy_command = subprocess.run(ssh_command)
        if deploy_command.returncode == 0:
            # POST BUILD - Copy PDF TRON
            print(color.SEPARATOR)
            #print('{}{}INSTALLING PDFTRON{}'.format(
            #    color.GREEN, color.BOLD, color.END))
            #print(color.SEPARATOR)
            #post_build_command = ['ssh', '-t',
            #                      'deploy@app.samson-manage.com', 'sh ~/postbuild.sh']
            ##subprocess.run(post_build_command)

            print(color.SEPARATOR)
            print('{}{}DEPLOY FINISHED{}'.format(
                color.GREEN, color.BOLD, color.END))
            print(color.SEPARATOR)
